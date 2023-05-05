import axios from "axios";
import { getToken } from "./TokenValidation";

export const getMyDriveDetails = async () => {
    try {
        return new Promise((resolve, reject) => {
            getToken().then(async (token) => {
                if (token) {
                    await axios.get(`http://localhost:3001/?token=${JSON.stringify(token)}`).then((data) => {
                        resolve(data.data)
                    }).catch((error) => {
                        reject(error.response.data);
                    })
                }
            }).catch((error) => {
                reject(error.message);
            })
        })
    } catch (error) {
        return error.message;
    }
};

export const getMyDriveFileList = async () => {
    try {
        return new Promise((resolve, reject) => {
            getToken().then(async (token) => {
                if (token) {
                    await axios.get(`http://localhost:3001/files?token=${JSON.stringify(token)}`).then((data) => {
                        resolve(data.data.files.items)
                    }).catch((error) => {
                        reject(error.response.data.message)
                    })
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
                    axios.delete(`http://localhost:3001/files/?token=${JSON.stringify(token)}&fileId=${fileId}`).then((data) => {
                        resolve(data.data)
                    }).catch((error) => {
                        reject(error.response.data.message)
                    })
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
                    fetch(`http://localhost:3001/folder/?token=${JSON.stringify(token)}&fileId=${fileId}`, { method: "GET" }).then((data) => {
                        resolve(data.blob())
                    }).catch((error) => {
                        reject(error.response.data.message)
                    })
                }
            }).catch((error) => {
                reject(error.message)
            })
        })
    } catch (error) {
        return error.message;
    }
}