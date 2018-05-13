* compile modules to be able to use it in production without using babel-node
* https://medium.com/@Cuadraman/how-to-use-babel-for-production-5b95e7323c2f

#
    "clean-dist": "rimraf -rf build && mkdir build",
    "#build-css": "node-sass scss/app.scss public/css/app.css",
    "build-server": "babel -d ./build ./devel -s",
    "#build-dist": "npm run clean-dist && npm run build-css && npm run build-server",
    "build-dist": "npm run clean-dist && npm run build-server",
    "#lint": "eslint source/ --quiet",
    "start-dist": "node ./build/index.js",
    "debug-dist": "node --debug ./build/index.js",
    "#test": "for i in $(ls tests/); do babel-node \"./tests/${i}\" | faucet ; done",
    "#validate": "npm run lint; npm run test && npm outdated --depth 0"
    
