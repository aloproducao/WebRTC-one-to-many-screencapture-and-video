import {
  LIVE,
  RECORDING,
  TIME,
  TIMER,
  CONNECTED,
  ADDCOORD,
  ADDVALIDITY,
  FIXATION,
  MESSAGE,
  ASPECTRATIO,
  CALIBRATE,
  CALIBRATIONRESULT,
  NAVBARPIN,
  DEVICELIST,
  LIVEVIDEO,
} from "./action-types";

const initialState = {
  connected: "Connected",
  live: true,
  recording: false,
  timer: false,
  time: "00:00:00",
  coord: [],
  validity: [],
  fixation: [-30, -30, 0, 0],
  message: "",
  ratio: "56.25",
  calibrate: false,
  pin: false,
  calibrationresult: false,
  list: [
    {
      id: {
        computerId: "",
        computerName: "",
        programId: "",
        programName: "",
        processId: "",
      },
      name: "",
      isSelected: false,
    },
  ],
  video: false,
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case LIVE:
      return { ...state, live: action.payload };
    case RECORDING:
      return { ...state, recording: action.payload };
    case TIME:
      return { ...state, time: action.payload };
    case CONNECTED:
      return { ...state, connected: action.payload };
    case TIMER:
      return { ...state, timer: action.payload };
    case FIXATION:
      return { ...state, fixation: action.payload };

    case ASPECTRATIO:
      return { ...state, ratio: action.payload };
    case ADDCOORD:
      // if array has 60 rows remove first and then add new coord
      return {
        ...state,
        coord: state.coord.slice(-30).concat([action.payload]),
      };
    case ADDVALIDITY:
      // if array has 60 rows remove first and then add new coord
      return {
        ...state,
        validity: state.validity.slice(-30).concat([action.payload]),
      };
    case MESSAGE:
      return { ...state, message: action.payload };
    case CALIBRATE:
      return { ...state, calibrate: action.payload };
    case CALIBRATIONRESULT:
      return { ...state, calibrationresult: action.payload };
    case NAVBARPIN:
      return { ...state, pin: action.payload };
    case DEVICELIST:
      return { ...state, list: action.payload };
    case LIVEVIDEO:
      return { ...state, video: action.payload };
    default:
      return state;
  }
};

export default rootReducer;
