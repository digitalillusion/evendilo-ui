import { Actions } from "../actions/createActions"
import { BASE_PATH, handleErrors } from "./reduxService"
import { getCookie } from "../functions"

function upload(state, destination, request) {
  const { value, entityName } = request.target
  const formData = new FormData()
  formData.append('file', value)

  fetch(`${BASE_PATH}/import/standard/${destination}/${entityName.key}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: new Headers({
      'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
    }),
  })
  .then(handleErrors)
  .catch(e => throw new Error(e))
  let payload = Object.assign({}, state.payload[destination], { started: true })
  return Promise.resolve(payload)
}

function refresh(request) {
  return Promise.resolve(request.target)
}

function status(destination) {
  return fetch(`${BASE_PATH}/import/standard/${destination}`, {
    credentials: 'include'
  })
  .then(handleErrors)
  .catch(e => throw new Error(e))
}

export async function handleImport(state, action, next) {
  let [destination, request] = action.params

  let fetch
  switch (request ? request.event : "") {
    case "upload":
      fetch = upload(state, destination, request)
      break
    case "refresh":
      fetch = refresh(request)
      break
    default:
      fetch = status(destination)
  }
  const payload = await fetch
  next(Actions.IMPORTER.propagate(action, {
    params: [destination],
    payload
  }))
}