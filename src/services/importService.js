import { Actions } from "../actions/createActions"
import { BASE_PATH, handleErrorsAndResponse } from "./reduxService"
import { getCookie } from "../functions"

function restart(family, destination) {
  return fetch(`${BASE_PATH}/import/${family}/${destination}`, {
    method: 'PUT',
    credentials: 'include',
    headers: new Headers({
      'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
    }),
  })
  .then(handleErrorsAndResponse)
  .catch(e => throw new Error(e))
}

function upload(state, request) {
  const { file, entity } = request
  const { family, destination, name } = entity
  const formData = new FormData()
  formData.append('file', file)

  fetch(`${BASE_PATH}/import/${family}/${destination}/${name}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: new Headers({
      'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
    }),
  })
  .then(handleErrorsAndResponse)
  .catch(e => throw new Error(e))
  let payload = {
    categories: [],
    started: true
  }
  return Promise.resolve(payload)
}

function refresh(request) {
  return Promise.resolve(request.target)
}

function status(family, destination) {
  return fetch(`${BASE_PATH}/import/${family}/${destination}`, {
    credentials: 'include'
  })
  .then(handleErrorsAndResponse)
  .catch(e => throw new Error(e))
}

export async function handleImport(state, action, next) {
  let [family, destination, request] = action.params

  let fetch
  switch (request ? request.event : "") {
    case "restart":
      fetch = restart(family, destination)
      break
    case "upload":
      fetch = upload(state, request)
      break
    case "refresh":
      fetch = refresh(request)
      break
    default:
      fetch = status(family, destination)
  }
  const payload = await fetch
  next(Actions.IMPORTER.propagate(action, {
    params: [family, destination],
    payload
  }))
}