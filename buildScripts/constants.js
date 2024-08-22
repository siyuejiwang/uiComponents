/** webpack external packages. */
const EXTERNALS = {
  react: "React",
  "react-dom": "ReactDOM",
  "react-router-dom": "ReactRouterDOM",
  antd: "antd",
  moment: "moment",
  mqtt: "mqtt",
  axios: "axios",
  "@gw/gw-request": "GwRequest",
  //todo 2.0时移除@gw/gw-config-center
  "@gw/odm-db": "configCenter",
  "@gw/gw-config-center": "configCenter",
  "@gw/web-basic-components": "GwWebBasicComponents",
  "@gw/web-business-components": "GwWebBusinessComponents",
  "@gw/hooks": "GwHooks",
};

module.exports = {
  EXTERNALS,
};
