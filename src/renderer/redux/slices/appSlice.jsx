

import { createSlice } from "@reduxjs/toolkit";



 async function fetchAppVersion() {
      try {
        const version = await window.electron.app.getVersion();
        console.log(version, "version");
        dispatch(setAppVersion(version));
      } catch (error) {
        console.error("Error fetching app version:", error);
      }
}


const initialState = {
    
    appVersion:"", // Get the app version from Electron's app module
    appName: "Prestamos",// Get the app name from Electron's app module
    appPath: "", // Get the app path from Electron's app module
    latesVersion: "", // Latest version from the server
    isUpdateAvailable: false, // Flag to indicate if an update is available            
    
}


const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setLatestVersion: (state, action) => {
            state.latesVersion = action.payload;
        },
        setIsUpdateAvailable: (state, action) => {
            state.isUpdateAvailable = action.payload;
        },
        setAppVersion: (state, action) => {
            state.appVersion = action.payload;
        },
        setAppName: (state, action) => {
            state.appName = action.payload;
        },
        setAppPath: (state, action) => {
            state.appPath = action.payload;
        },
        resetAppData: (state) => {
            state.appVersion = "";
            state.appName = "";
            state.appPath = "";
        }

    },
})



export const {   setAppVersion,setAppName ,  isUpdateAvailable,setLatestVersion  ,setIsUpdateAvailable } = appSlice.actions;
export default  appSlice.reducer;