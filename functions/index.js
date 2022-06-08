const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { convertTZ } = require("./utils/datetime");

exports.checkroutines = functions.pubsub
  .schedule("* * * * *")
  .timeZone("America/Mexico_City")
  .onRun(async (context) => {
    const snaphot = await admin.database().ref("routines").once("value");
    const routines = snaphot.val();
    const now = convertTZ(new Date(context.timestamp), "America/Mexico_City");
    console.log({ now });

    for (const routineKey in routines) {
      if (Object.hasOwnProperty.call(routines, routineKey)) {
        const routine = routines[routineKey];
        const hour =
          routine.time.period.toLowerCase() === "a.m." ?
            routine.time.hour :
            routine.time.hour + 12;
        const minutes = routine.time.minutes;

        if (
          routine.active === true &&
          // routine.pending === true &&
          now.getHours() === hour &&
          now.getMinutes() === minutes
        ) {
          // admin.database().ref(`routines/${routineKey}`).update({
          //   pending: false,
          // });
          const actions = routine.actions;

          for (const actionKey in actions) {
            if (Object.hasOwnProperty.call(actions, actionKey)) {
              const action = actions[actionKey];
              admin
                .database()
                .ref(`${action.deviceType}/${actionKey}`)
                .update({
                  [action.modificator]: action.state,
                });
            }
          }
        }
      }
    }
  });

// exports.resetRoutines = functions.pubsub
//   .schedule("0 0 * * *")
//   .timeZone("America/Mexico_City")
//   .onRun((context) => {
//     const snaphot = admin.database().ref("routines").once("value");
//     const routines = snaphot.val();

//     for (const routineKey in routines) {
//       if (Object.hasOwnProperty.call(routines, routineKey)) {
//         admin.database().ref(`routines/${routineKey}`).update({
//           pending: true,
//         });
//       }
//     }
//   });
