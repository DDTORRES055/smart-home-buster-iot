const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports.checkroutines = functions.pubsub
  .schedule("* * * * *")
  .timeZone("America/Mexico_City")
  .onRun((context) => {
    const snaphot = admin.database().ref("routines").once("value");
    const routines = snaphot.val();

    for (const routineKey in routines) {
      if (Object.hasOwnProperty.call(routines, routineKey)) {
        const routine = routines[routineKey];
        const now = new Date();
        const start = new Date(routine.start);

        if (start.getTime() <= now.getTime() && routine.active === true) {
          admin.database().ref(`routines/${routineKey}`).update({
            active: false,
          });
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

exports.resetRoutines = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("America/Mexico_City")
  .onRun((context) => {
    const snaphot = admin.database().ref("routines").once("value");
    const routines = snaphot.val();

    for (const routineKey in routines) {
      if (Object.hasOwnProperty.call(routines, routineKey)) {
        admin.database().ref(`routines/${routineKey}`).update({
          active: true,
        });
      }
    }
  });
