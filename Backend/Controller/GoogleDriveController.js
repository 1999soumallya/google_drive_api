const expressAsyncHandler = require('express-async-handler')
const { google } = require('googleapis')
const Constants = require('../Config/Constants')
const { default: axios } = require('axios')
const path = require("path")
const fs = require("fs")
const moment = require('moment')

const oauth2Client = new google.auth.OAuth2(Constants.GoogleAccessKeys.CLIENT_ID, Constants.GoogleAccessKeys.CLIENT_SECRET, Constants.GoogleAccessKeys.REDIRECT_URL)

const createauthlink = expressAsyncHandler(async (req, res) => {
    try {
        const authorizationUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: Constants.GoogleAccessKeys.scopes,
            include_granted_scopes: true,
            prompt: "consent"
        })
        res.status(200).send(authorizationUrl)
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const handlegoogleredirect = expressAsyncHandler(async (req, res) => {
    try {
        const { code } = req.query
        oauth2Client.getToken(code, (err, tokens) => {
            if (err) {
                res.status(400).json({ message: "Create token error", error: err })
            } else {
                res.redirect(`http://localhost:3000?accessToken=${tokens.access_token}&refreshToken=${tokens.refresh_token}`)
            }
        })
    } catch (error) {
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const getValidToken = expressAsyncHandler(async (req, res) => {
    try {
        const { refreshToken } = req.body

        axios.post(`https://www.googleapis.com/oauth2/v4/token`, { client_id: Constants.GoogleAccessKeys.CLIENT_ID, client_secret: Constants.GoogleAccessKeys.CLIENT_SECRET, refresh_token: refreshToken, grant_type: "refresh_token" }, { headers: { "Content-Type": "application/json" } }).then((details) => {
            res.status(200).json({ accessToken: details.data.access_token })
        }).catch((error) => {
            console.log(error)
            res.status(400).json({ message: "Token validation checking failed", success: false, error: error.message });
        })

    } catch (error) {
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const GetAboutMyDrive = expressAsyncHandler(async (req, res) => {
    try {
        let { token } = req.query

        token = JSON.parse(token)

        oauth2Client.setCredentials({ access_token: token.accessToken, refresh_token: token.refreshToken });
        const driveClient = google.drive({ version: 'v2', auth: oauth2Client })

        driveClient.about.get().then((data) => {
            res.status(200).json({ message: "Fetch drive details success", success: true, data: data.data })
        }).catch((error) => {
            res.status(400).json({ message: "Fetch drive details failed", success: false, error: error })
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const GetAllFilesFromMyDrive = expressAsyncHandler(async (req, res) => {
    try {
        let { token } = req.query

        token = JSON.parse(token)

        oauth2Client.setCredentials({ access_token: token.accessToken, refresh_token: token.refreshToken });
        const driveClient = google.drive({ version: 'v2', auth: oauth2Client })

        await driveClient.files.list({ orderBy: ["title"], q: "'root' in parents and mimeType = 'application/vnd.google-apps.folder'", }).then(async (folder) => {
            await driveClient.files.list({ orderBy: ["title"], q: "'root' in parents and mimeType != 'application/vnd.google-apps.folder'", }).then((files) => {
                res.status(200).json({ message: "Get all the files success", success: true, folder: folder.data, files: files.data })
            }).catch((error) => {
                console.log(error);
                res.status(400).json({ message: "Get all the files failed", success: false, error: error })
            })
        }).catch((error) => {
            console.log(error);
            res.status(400).json({ message: "Get all the files failed", success: false, error: error })
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const DeleteFileFromMyDrive = expressAsyncHandler(async (req, res) => {
    try {
        let { token, fileId } = req.query

        token = JSON.parse(token)

        oauth2Client.setCredentials({ access_token: token.accessToken, refresh_token: token.refreshToken });
        const driveClient = google.drive({ version: 'v3', auth: oauth2Client })

        await driveClient.files.delete({ fileId: fileId }).then((files) => {
            res.status(200).json({ message: "Delete file success", success: true, files: files.data })
        }).catch((error) => {
            console.log(error);
            res.status(400).json({ message: "Delete file failed", success: false, error: error })
        })

    } catch (error) {
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const UpdateMyDriveFile = expressAsyncHandler(async (req, res) => {
    try {
        let { fileId, details } = req.body
        let { token, access_token } = req.query
        // token = JSON.parse(token)
        // details = JSON.parse(details)
        // details.file_name

        oauth2Client.setCredentials({ refresh_token: token, access_token: access_token });
        const driveClient = google.drive({ version: 'v2', auth: oauth2Client })

        driveClient.files.update({ requestBody: { originalFilename: req.body.file_name, title: req.body.file_name }, fileId: fileId, }).then((files) => {
            res.status(200).json({ message: "Update file success", success: true, files: files.data })
        }).catch((error) => {
            res.status(400).json({ message: "Update file failed", success: false, error: error })
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const CreateFileOnDrive = expressAsyncHandler(async (req, res) => {
    try {
        oauth2Client.setCredentials({ refresh_token: req.body.token, access_token: req.body.access_token });
        const driveClient = google.drive({ version: 'v3', auth: oauth2Client })

        if (req.files.upload_file) {
            let uploadPath = path.join(__dirname, '../public/') + req.files.upload_file.name;
            req.files.upload_file.mv(uploadPath, async (error) => {
                if (error) {
                    res.status(400).json({ message: "File upload error", success: false, error: error })
                } else {
                    const filemetadata = { name: req.files.upload_file.name, mimeType: req.files.upload_file.mimetype, parents: req.body.folderId ? [req.body.folderId] : [], }
                    const media = { mimeType: req.files.upload_file.mimetype, body: fs.createReadStream(uploadPath) }
                    driveClient.files.create({ requestBody: filemetadata, media: media, fields: 'id, name', }).then((files) => {
                        fs.unlink(uploadPath)
                        res.status(200).json({ message: "Upload file success", success: true, files: files.data })
                    }).catch((error) => {
                        fs.unlink(uploadPath)
                        res.status(400).json({ message: "Upload file failed", success: false, error: error })
                    })
                }
            })
        }

    } catch (error) {
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const CreateFloderInMyDrive = expressAsyncHandler(async (req, res) => {
    try {
        const { token, access_token, folderName } = req.body
        oauth2Client.setCredentials({ refresh_token: token, access_token: access_token });
        const driveClient = google.drive({ version: 'v3', auth: oauth2Client })

        driveClient.files.create({ resource: { name: folderName, mimeType: 'application/vnd.google-apps.folder', }, fields: 'id, name', }).then((files) => {
            res.status(200).json({ message: "Folder create success", success: true, files: files.data })
        }).catch((error) => {
            console.log(error)
            res.status(400).json({ message: "Folder create failed", success: false, error: error })
        })
    } catch (error) {
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const DownloadFileFromDrive = expressAsyncHandler(async (req, res) => {
    try {
        let { token, fileId } = req.query

        token = JSON.parse(token)

        let filename = moment().format("YYYY-DD-MM").toString()

        oauth2Client.setCredentials({ access_token: token.accessToken, refresh_token: token.refreshToken });
        const driveClient = google.drive({ version: 'v2', auth: oauth2Client })
        res.attachment(filename)
        await driveClient.files.get({ fileId: fileId, alt: "media", }, { responseType: "stream" }).then((files) => {
            files.data.pipe(res)
        }).catch((error) => {
            console.log(error);
            res.status(400).json({ message: "Download files failed", success: false, error: error })
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

const GetChildrenOfAFile = expressAsyncHandler(async (req, res) => {
    try {
        let { token, folderId } = req.query

        token = JSON.parse(token)

        oauth2Client.setCredentials({ access_token: token.accessToken, refresh_token: token.refreshToken });
        const driveClient = google.drive({ version: 'v2', auth: oauth2Client })

        await driveClient.files.list({ folderId: folderId, q: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents` }).then(async (folder) => {
            await driveClient.files.list({ folderId: folderId, q: `mimeType != 'application/vnd.google-apps.folder' and '${folderId}' in parents` }).then((files) => {
                res.status(200).json({ message: "Get all the files form a folder success", success: true, folder: folder.data, files: files.data })
            }).catch((error) => {
                console.log(error);
                res.status(400).json({ message: "Get all the files a folder failed", success: false, error: error })
            })
        }).catch((error) => {
            console.log(error);
            res.status(400).json({ message: "Get all the files a folder failed", success: false, error: error })
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Something is wrong!", success: false, error: error })
    }
})

module.exports = { createauthlink, handlegoogleredirect, getValidToken, GetAboutMyDrive, GetAllFilesFromMyDrive, DeleteFileFromMyDrive, UpdateMyDriveFile, CreateFileOnDrive, CreateFloderInMyDrive, DownloadFileFromDrive, GetChildrenOfAFile }