import axios from "axios";
import { getToken } from "./TokenValidation";

export const getMyDriveDetails = async () => {
    try {
        return new Promise((resolve, reject) => {
            getToken().then(async (token) => {
                if (token) {
                    await axios.get(`${process.env.REACT_APP_API_URL}/?token=${JSON.stringify(token)}`).then((data) => {
                        resolve(data.data)
                    }).catch((error) => {
                        reject(error.response.data);
                    })
                } else {
                    reject("Please login your account")
                }
            }).catch((error) => {
                reject(error.message);
            })
        })
    } catch (error) {
        return error.message;
    }
};

export const getMyDriveFileList = async (folderId = "") => {
    try {
        let query
        return new Promise((resolve, reject) => {
            getToken().then(async (token) => {
                if (token) {
                    if (folderId !== "") {
                        query = `token=${JSON.stringify(token)}&folderId=${folderId}`
                    } else {
                        query = `token=${JSON.stringify(token)}`
                    }
                    await axios.get(`${process.env.REACT_APP_API_URL}/files?${query}`).then((data) => {
                        resolve(data.data)
                    }).catch((error) => {
                        reject(error.response.data.message)
                    })
                } else {
                    reject("Please login your account")
                }
            }).catch((error) => {
                reject(error.message)
            })
        })
    } catch (error) {
        return error.message;
    }
}

export const deleteMyDriveFile = async (fileId) => {
    try {
        return new Promise((resolve, reject) => {
            getToken().then((token) => {
                if (token) {
                    axios.delete(`${process.env.REACT_APP_API_URL}/files/?token=${JSON.stringify(token)}&fileId=${fileId}`).then((data) => {
                        resolve(data.data)
                    }).catch((error) => {
                        reject(error.response.data.message)
                    })
                } else {
                    reject("Please login your account")
                }
            }).catch((error) => {
                reject(error.message)
            })
        })
    } catch (error) {
        return error.message;
    }
}

export const downloadMyDriveFile = async (fileId) => {
    try {
        return new Promise((resolve, reject) => {
            getToken().then((token) => {
                if (token) {
                    fetch(`${process.env.REACT_APP_API_URL}/folder/?token=${JSON.stringify(token)}&fileId=${fileId}`, { method: "GET" }).then((data) => {
                        resolve(data.blob())
                    }).catch((error) => {
                        reject(error.response.data.message)
                    })
                } else {
                    reject("Please login your account")
                }
            }).catch((error) => {
                reject(error.message)
            })
        })
    } catch (error) {
        return error.message;
    }
}