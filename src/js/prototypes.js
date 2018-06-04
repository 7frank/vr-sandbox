// FIXME chrome returns nodelist firefox array
NodeList.prototype.toArray = function () { return Array.from(this); };
/*eslint-disable */
Array.prototype.toArray = function () { return this; };
/* eslint-enable */
