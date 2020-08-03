import React from "react"
import FormattedMessage from "react-intl/lib/src/components/message"

/**
 * Translation function. It looks for the id in the i18n strings and returns a placeholder if not found.
 * Whether the matched i18n strings contains placeholders (The following are interpreted as such: {0}, {1}...)
 * each element of the values vararg is used to replace the placeholder at the corresponding index, respectively
 * ({0} with vararg[0], {1} with vararg[1]...)
 * @param id The translation key
 * @param values Values to substitute into placeholders
 * @return {*}
 */
export const t = (id, ...values) => {
  return td(id, null, ...values)
}

/**
 * Translation function. It looks for the id in the i18n strings and returns the defaultMessage parameter if not found.
 * Whether the matched i18n strings contains placeholders (The following are interpreted as such: {0}, {1}...)
 * each element of the values vararg is used to replace the placeholder at the corresponding index, respectively
 * ({0} with vararg[0], {1} with vararg[1]...)
 * @param id The translation key
 * @param defaultMessage The default message
 * @param values Values to substitute into placeholders
 * @return {*}
 */
export const td = (id, defaultMessage = '{' + id + '}', ...values) => {
  let vals = {}
  values.forEach((v, index) => vals[index] = v)
  const formattedMessage = <FormattedMessage id={ id } values={vals} defaultMessage={defaultMessage}/>
  return formattedMessage
}

/**
 * @param o
 * @return {boolean|arg is Array<any>} True if the parameter is null, undefined, empty string,
 * empty array or empty object, false otherwise
 */
export const isEmpty = (o) => {
  let isEmptyArray = Array.isArray(o) && o.length === 0
  let isEmptyObject = o === Object(o) && Object.keys(o).length === 0
  return o  == null || typeof o === 'undefined' || "" === o || isEmptyArray || isEmptyObject
}

/**
 *
 * @param value
 * @return {*|boolean} true if value is an object
 */
export const isObject = value => {
  return value && typeof value === 'object' && value.constructor === Object;
}