import axios from "axios";

export const storeTokenData = async (token, refreshToken, expirationDate) => {
    sessionStorage.setItem("accessToken", token);
    sessionStorage.setItem("refreshToken", refreshToken);
    sessionStorage.setItem("expirationDate", expirationDate);
};

export const getToken = async () => {
    if (tokenExpired()) {
        const refreshtoken = sessionStorage.getItem("refreshToken");
        const token = await getValidTokenFromServer(refreshtoken);
        sessionStorage.setItem("accessToken", token.accessToken);
        sessionStorage.setItem("expirationDate", newExpirationDate());
        return token;
    } else {
        const token = { accessToken: sessionStorage.getItem("accessToken"), refreshToken: sessionStorage.getItem("refreshToken") }
        return token;
    }
};

const newExpirationDate = () => {
    var expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    return expiration;
};

const tokenExpired = () => {
    const now = Date.now();
    const expirationDate = sessionStorage.getItem("expirationDate");
    const expDate = new Date(expirationDate);
    if (now > expDate.getTime()) {
        return true;
    }
    return false;
};

const getValidTokenFromServer = async (refreshToken) => {
    try {
        await axios.post("http://localhost:3001/getValidToken", { refreshToken: JSON.stringify(refreshToken) }, { headers: { "Content-Type": "application/json" } }).then((response) => {
            if (response) {
                return response.data
            }
        }).catch((error) => {
            throw new Error("Issue getting new token", error.response.data.message);
        })
    } catch (error) {
        throw new Error("Issue getting new token", error.message);
    }
};