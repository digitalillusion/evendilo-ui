import { Actions } from "../actions/createActions"
import { BASE_PATH, handleErrorsAndResponse } from "./reduxService"
import { getCookie, isEmpty } from "../functions"

function login(destination) {
  window.location.href = `${BASE_PATH}/oauth2/authorization/pierretappeti-${destination}`
  return Promise.resolve({
    anonymous: true
  })
}

function logout(redirect  = true) {
  if (redirect) {
    fetch(`${BASE_PATH}/logout`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'x-www-form-urlencoded',
        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
      }),
      credentials: 'include'
    })
      .then(handleErrorsAndResponse)
      .catch(e => throw new Error(e))
  }
  return Promise.resolve({
    anonymous: true
  })
}

function whois() {
  return fetch(`${BASE_PATH}/session`, {
    credentials: 'include'
  })
    .then(async response => {
      let authentication = await handleErrorsAndResponse(response);
      if (isEmpty(authentication)) {
        return logout(false)
      }
      return Promise.resolve({
        anonymous: false,
        authentication: authentication
      })
    })
    .catch(_ => logout(false))
}

export async function handleSession(dispatch, action, next) {
  let [request] = action.params

  let fetch
  switch (request ? request.event : "") {
    case "login":
      fetch = login(request.destination)
      break
    case "logout":
      fetch = logout()
      break
    case "whois":
      fetch = whois()
      break
    case "ping":
    default:
      return whois()
  }
  const payload = await fetch
  next(Actions.SESSION.propagate(action, {
    params: [],
    payload
  }))
}