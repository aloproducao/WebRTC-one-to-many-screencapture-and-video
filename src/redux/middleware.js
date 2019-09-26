import { HubConnectionBuilder } from "@aspnet/signalr";
import { LIVE, TIMER } from "./action-types";
import axios from "axios";

//SignalR middleware

export const SignalR = store => next => action => {
  switch (action.type) {
    case LIVE:
      //check connection status
      axios
        .get(`${window.APIaddress}/api/nlinx/status`)
        .then(response =>
          //dispatch connecting status to redux
          store.dispatch({ type: "CONNECTED", payload: response.data })
        )
        .catch(error => console.log(error));

      // Open the eye tracking stream
      let connection = new HubConnectionBuilder()
        .withUrl(`${window.APIaddress}/eyeTrackerStreamHub`)
        .build();
      connection.serverTimeoutInMilliseconds = 120000000;

      connection.start().then(() => {
        connection.stream("EyeTrackerDataCounter").subscribe({
          next: item => {
            //clear The 'eat gaze trial' TimeOut and interval
            clearInterval(this.noData);
            clearInterval(this.eatGazeTrial);

            //  convert json to array
            const itemArray = JSON.parse(item);
            const isValid = itemArray.Validity;
            const screenSize = itemArray.AspectRatio.split(", ");
            const ratio = (screenSize[1] / screenSize[0]) * 100;
            const xy = [
              (itemArray.XCoord * 100).toFixed(2),
              (itemArray.YCoord * 100).toFixed(2)
            ];

            // dispatch
            store.dispatch({ type: "ASPECTRATIO", payload: ratio });
            store.dispatch({ type: "ADDCOORD", payload: xy });
            store.dispatch({ type: "ADDVALIDITY", payload: isValid });

            // if there is no data from the stream in 1800 ms, empty coord will be pushed to clear the gaze trial
            this.noData = setTimeout(function () {
              let i = 0;
              this.eatGazeTrial = setInterval(function () {
                if (i > 31) {
                  clearInterval(this.eatGazeTrial);
                } else {
                  const empty = [NaN, NaN];
                  const notValid = 0;
                  store.dispatch({ type: "ADDCOORD", payload: empty });
                  store.dispatch({ type: "ADDVALIDITY", payload: notValid });
                  i++;
                }
              }, 100);
            }, 1800);
          },
          complete: () => {
            console.log("complete");
          },
          error: err => {
            console.log(err);
          }
        });
      });

      // Open the fixations stream
      let fixationConnection = new HubConnectionBuilder()
        .withUrl(`${window.APIaddress}/movementStreamHub`)
        .build();
      fixationConnection.serverTimeoutInMilliseconds = 120000000;

      fixationConnection.start().then(() => {
        fixationConnection.stream("MovementDataCounter").subscribe({
          next: item => {
            const itemArray = JSON.parse(item);
            if (itemArray.MovementState === 1) {
              if ((itemArray.XCoord !== "0") & (itemArray.YCoord !== "0")) {
                //clear The 'eat circle' TimeOut and interval
                clearInterval(this.noFixation);

                const fixation = [
                  (itemArray.XCoord * 100).toFixed(2),
                  (itemArray.YCoord * 100).toFixed(2)
                ];

                store.dispatch({ type: "FIXATION", payload: fixation });
              }
              // if there is no data from the stream in 300 ms, empty coord will be pushed to clear the circles
              this.noFixation = setTimeout(function() {
                const nocircle = [-30, -30];
                store.dispatch({ type: "FIXATION", payload: nocircle });
              }, 300);
            }
          },
          complete: () => {
            console.log("complete");
          },
          error: err => {
            console.log(err);
          }
        });
      });

      // create the status hub
      let statusConnection = new HubConnectionBuilder()
        .withUrl(`${window.APIaddress}/statusHub`)
        .build();
      statusConnection.on("Connecting", data => {
        store.dispatch({ type: "CONNECTED", payload: "Connecting" });
      });
      statusConnection.on("Connected", data => {
        store.dispatch({ type: "CONNECTED", payload: "Connected" });
      });
      statusConnection.on("NotConnected", data => {
        store.dispatch({ type: "CONNECTED", payload: "NotConnected" });
      });
      statusConnection.on("Failed", data => {
        store.dispatch({ type: "CONNECTED", payload: "Failed" });
      });
      statusConnection.on("Disconnected", data => {
        store.dispatch({ type: "CONNECTED", payload: "Disconnected" });
      });
      statusConnection.on("Reconnected", data => {
        store.dispatch({ type: "CONNECTED", payload: "Reconnected" });
      });
      statusConnection.on("Closed", data => {
        store.dispatch({ type: "CONNECTED", payload: "Closed" });
      });
      statusConnection.on("NewSession", data => {});
      statusConnection.on("RecordingStarted", data => {
        console.log("recording started");
        store.dispatch({ type: "RECORDING", payload: true });
        store.dispatch({ type: "TIMER", payload: true });
      });
      statusConnection.on("RecordingStopped", data => {
        store.dispatch({ type: "RECORDING", payload: false });
        // reset local time
        store.dispatch({ type: "TIME", payload: "00:00:00" });
      });
      statusConnection.on("SessionChanged", data => {});
      statusConnection.on("CalibrationStarted", data => {
        store.dispatch({ type: "CALIBRATE", payload: true });
      });
      statusConnection.on("CalibrationStopped", data => {
        store.dispatch({ type: "CALIBRATIONRESULT", payload: true });
        store.dispatch({ type: "CALIBRATE", payload: false });
      });
      statusConnection.on("EyeTrackerSet", data => {
        // Make call to backend to get list
        axios
          .get(`${window.APIaddress}/api/eyetracking/geteyetrackers`)
          .then(response =>
            store.dispatch({ type: "DEVICELIST", payload: response.data })
          )
          .catch(error => console.log(error));
      });
      statusConnection.start();
      statusConnection.serverTimeoutInMilliseconds = 120000000;

      break;

    case TIMER:
      if (typeof sessionConnection === "undefined") {
        let sessionConnection = new HubConnectionBuilder()
          .withUrl(`${window.APIaddress}/sessionElapsedTimeHub`)
          .build();

        sessionConnection.serverTimeoutInMilliseconds = 2000;

        sessionConnection.start().then(() => {
          sessionConnection.stream("ElapsedTimeCounter").subscribe({
            next: item => {
              const time = JSON.parse(item).split(".");
              store.dispatch({ type: "TIME", payload: "0" + time[0] });
            },
            complete: () => {
              console.log("complete");
            },
            error: err => {}
          });
        });
      }

      break;

    default:
  }
  next(action);
};

export default SignalR;
