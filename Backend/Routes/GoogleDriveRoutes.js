const { createauthlink, handlegoogleredirect, getValidToken, GetAboutMyDrive, GetAllFilesFromMyDrive, DeleteFileFromMyDrive, UpdateMyDriveFile, CreateFileOnDrive, CreateFloderInMyDrive, DownloadFileFromDrive, GetChildrenOfAFile } = require("../Controller/GoogleDriveController")

const Router = require("express").Router()

Router.route("/createauthlink").get(createauthlink)

Router.route("/handlegoogleredirect").get(handlegoogleredirect)

Router.route("/getValidToken").post(getValidToken)

Router.route("/").get(GetAboutMyDrive)

Router.route("/files").get(GetAllFilesFromMyDrive).delete(DeleteFileFromMyDrive).put(UpdateMyDriveFile).post(CreateFileOnDrive)

Router.route("/folder").post(CreateFloderInMyDrive).get(DownloadFileFromDrive)

Router.route("/children").get(GetChildrenOfAFile)


module.exports = Router