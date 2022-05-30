import { getDatabase, ref, onValue, off, get } from 'firebase/database'
import { app } from './app'

export const database = getDatabase(app)

export const setListener = (path, callbackOnValue) => {
  const listenerRef = ref(database, path)
  onValue(listenerRef, (snapshot) => {
    callbackOnValue(snapshot.val())
  })
}

export const removeListener = (path) => {
  const listenerRef = ref(database, path)
  off(listenerRef)
}
