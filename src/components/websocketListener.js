import SockJS from 'sockjs-client'
import Stomp from 'stomp-websocket'

const cache = {

}

class WebsocketListener {

  constructor(websocket) {
    this.initialized = false;
    this.registrations = [];
    this.client = null;
    this.timeout = 0;
    this.websocket = websocket || '/messages';
    this.nextConnectionTimestamp = -1;
  }

  static instance(websocket) {
    if (!cache[websocket]) {
      cache[websocket] = new WebsocketListener(websocket)
    } else {
      cache[websocket].unregister(cache[websocket].registrations)
    }
    return cache[websocket]
  }

  initialize (headers = {}, subscriptionId = undefined) {
    let promise = resolve => {
      let socket = null

      const reconnect = () => {
        let reconInv
        let recon = () => {
          let timestamp = new Date().getTime();
          if (timestamp < this.nextConnectionTimestamp) {
            return false;
          }
          this.nextConnectionTimestamp = timestamp + 1000 * Math.pow(2, this.timeout++)

          if (this.client !== null) {
            if (reconInv) {
              clearInterval(reconInv)
            }
            return true
          }
          socket = new SockJS(this.websocket);
          this.client = Stomp.over(socket)
          this.client.connect(headers,
            () => {
              this.timeout = 0
              this.initialized = true
              if (reconInv) {
                clearInterval(reconInv)
              }
              let registrations = []
              this.registrations.forEach(r => registrations.push(r));
              this.unregister(this.registrations)
              this.register(registrations, headers, subscriptionId)

              resolve(this.client)
            },
            () => {
              this.client = null
              if (this.initialized) {
                reconnect()
              }
            })
          return false
        }
        if (!recon()) {
          reconInv = setInterval(recon, 1000)
        }
      }

      if (!this.initialized) {
        this.nextConnectionTimestamp = -1
        reconnect()
      } else {
        resolve(this.client)
      }
    }

    return new Promise(promise)
  }

  register = (registrations, headers, subscriptionId = null, callback = () => {}) => {
    let subscription = subscriptionId ? { id: subscriptionId } : {}
    this.initialize(headers, subscriptionId).then(client => {
      let newRegistrations = []
      registrations.forEach(registration => {
        if (!this.registrations.map(r => r.route).includes(registration.route)) {
          this.registrations.push(registration)
          newRegistrations.push(registration)
        }
      })

      newRegistrations.forEach(registration => {
        registration.meta = client.subscribe(registration.route, registration.callback, subscription)
        callback(registration)
      })
    })
  }

  unregister = unregistrations => {
    let unsubscribedRegistrations = []
    unregistrations.forEach(unregistration => {
      let existingIndex = this.registrations.map(r => r.route).indexOf(unregistration.route)
      if (existingIndex >= 0) {
        let unsubscribedRegistration = this.registrations[existingIndex]
        if (unsubscribedRegistration.meta && unsubscribedRegistration.meta.unsubscribe) {
          unsubscribedRegistration.meta.unsubscribe()
        }
        unsubscribedRegistrations.push(unsubscribedRegistration)
      }
    })
    unsubscribedRegistrations.forEach(unsubscribedRegistration => {
      this.registrations.splice(this.registrations.indexOf(unsubscribedRegistration), 1)
    })
  }
}
export default WebsocketListener