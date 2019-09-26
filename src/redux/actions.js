import {
  RECORDING,
  TIMER,
  TIME,
  LIVE,
  CONNECTED,
  MESSAGE,
  FIXATION,
  ASPECTRATIO,
  CALIBRATE,
  CALIBRATIONRESULT,
  NAVBARPIN,
  DEVICELIST,
  LIVEVIDEO
} from "./action-types";

export const checkLive = live => ({
  type: LIVE,
  payload: live
});
export const checkRecording = recording => ({
  type: RECORDING,
  payload: recording
});
export const checkConnected = connected => ({
  type: CONNECTED,
  payload: connected
});
export const setBaseTime = time => ({
  type: TIME,
  payload: time
});
export const setFixation = fixation => ({
  type: FIXATION,
  payload: fixation
});
export const setTimer = timer => ({
  type: TIMER,
  payload: timer
});
export const setTime = time => ({
  type: TIME,
  payload: time
});
export const setMessage = message => ({
  type: MESSAGE,
  payload: message
});
export const setAspectRatio = ratio => ({
  type: ASPECTRATIO,
  payload: ratio
});
export const checkCalibrate = calibrate => ({
  type: CALIBRATE,
  payload: calibrate
});
export const calibrationResult = calibrationresult => ({
  type: CALIBRATIONRESULT,
  payload: calibrationresult
});
export const checkNavbarPin = pin => ({
  type: NAVBARPIN,
  payload: pin
});
export const deviceList = list => ({
  type: DEVICELIST,
  payload: list
});
export const liveVideo = video => ({
  type: LIVEVIDEO,
  payload: video
});
