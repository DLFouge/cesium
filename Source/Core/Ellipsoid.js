/*global define*/
define([
        './DeveloperError',
        './Math',
        './Cartesian3',
        './Cartographic2',
        './Cartographic3'
    ], function(
        DeveloperError,
        CesiumMath,
        Cartesian3,
        Cartographic2,
        Cartographic3) {
    "use strict";

    /**
     * DOC_TBA
     * @name Ellipsoid
     *
     * @param {Cartesian3} radii The ellipsoid's radius in the x, y, and z ds.
     *
     * @constructor
     * @immutable
     *
     * @exception {DeveloperError} One argument is required.
     * @exception {DeveloperError} All radii components must be greater than or equal to zero.
     */
    function Ellipsoid() {
        if (arguments.length === 0) {
            throw new DeveloperError("One argument is required.");
        }

        if (arguments[0].x < 0 || arguments[0].y < 0 || arguments[0].z < 0) {
            throw new DeveloperError("All radii components must be greater than or equal to zero.", "radii");
        }

        var radii = Cartesian3.clone(arguments[0]);
        var x = radii.x;
        var y = radii.y;
        var z = radii.z;

        this._radii = radii;
        this._radiiSquared = new Cartesian3(
                x * x,
                y * y,
                z * z);
        this._radiiToTheFourth = new Cartesian3(
                x * x * x * x,
                y * y * y * y,
                z * z * z * z);
        this._oneOverRadii = new Cartesian3(
                1.0 / x,
                1.0 / y,
                1.0 / z);
        this._oneOverRadiiSquared = new Cartesian3(
                1.0 / (x * x),
                1.0 / (y * y),
                1.0 / (z * z));
    }

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Ellipsoid} DOC_TBA
     *
     * @see agi_getWgs84EllipsoidEC
     */
    Ellipsoid.getWgs84 = function() {
        return new Ellipsoid(new Cartesian3(6378137.0, 6378137.0, 6356752.314245));
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Ellipsoid} DOC_TBA
     */
    Ellipsoid.getScaledWgs84 = function() {
        return new Ellipsoid(new Cartesian3(1.0, 1.0, 6356752.314245 / 6378137.0));
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Ellipsoid} DOC_TBA
     */
    Ellipsoid.getUnitSphere = function() {
        return new Ellipsoid(new Cartesian3(1.0, 1.0, 1.0));
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.getRadii = function() {
        return this._radii;
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.getRadiiSquared = function() {
        return this._radiiSquared;
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.getRadiiToTheFourth = function() {
        return this._radiiToTheFourth;
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.getOneOverRadii = function() {
        return this._oneOverRadii;
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.getOneOverRadiiSquared = function() {
        return this._oneOverRadiiSquared;
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Number} DOC_TBA
     */
    Ellipsoid.prototype.getMinimumRadius = function() {
        var radii = this.getRadii();
        return Math.min(radii.x, Math.min(radii.y, radii.z));
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @return {Number} DOC_TBA
     */
    Ellipsoid.prototype.getMaximumRadius = function() {
        var radii = this.getRadii();
        return Math.max(radii.x, Math.max(radii.y, radii.z));
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param {Cartesian3} positionOnEllipsoid DOC_TBA
     *
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.geocentricSurfaceNormal = function(positionOnEllipsoid) {
        var position = Cartesian3.clone(positionOnEllipsoid);
        return position.normalize();
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param {Cartesian3} positionOnEllipsoid DOC_TBA
     *
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.geodeticSurfaceNormal = function(positionOnEllipsoid) {
        var position = Cartesian3.clone(positionOnEllipsoid);
        return (position.multiplyComponents(this.getOneOverRadiiSquared())).normalize();
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param {Cartographic3} position DOC_TBA
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.geodeticSurfaceNormalc = function(position) {
        var cosLatitude = Math.cos(position.latitude);

        return new Cartesian3(
                cosLatitude * Math.cos(position.longitude),
                cosLatitude * Math.sin(position.longitude),
                Math.sin(position.latitude));
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param {Cartographic3} position DOC_TBA  (or Cartographic2)
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.toCartesian = function(position) {
        var n = this.geodeticSurfaceNormalc(position);
        var k = this.getRadiiSquared().multiplyComponents(n);
        var gamma = Math.sqrt((k.x * n.x) + (k.y * n.y) + (k.z * n.z));

        var rSurface = k.divideByScalar(gamma);
        return rSurface.add(n.multiplyWithScalar(position.height || 0.0));
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * Input is array of Cartographic3 or Cartographic2.
     */
    Ellipsoid.prototype.toCartesians = function(positions) {
        if (positions) {
            var cartesians = [];

            var length = positions.length;
            for ( var i = 0; i < length; ++i) {
                cartesians.push(this.toCartesian(positions[i]));
            }

            return cartesians;
        }
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param position Input is Cartographic3 or Cartographic2.
     */
    Ellipsoid.prototype.cartographicDegreesToCartesian = function(position) {
        if (position) {
            var cartographic = new Cartographic3(
                    CesiumMath.toRadians(position.longitude),
                    CesiumMath.toRadians(position.latitude),
                    position.height || 0.0);
            return this.toCartesian(cartographic);
        }
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param positions Input is array of Cartographic3 or Cartographic2.
     */
    Ellipsoid.prototype.cartographicDegreesToCartesians = function(positions) {
        if (positions) {
            var cartesians = [];

            var length = positions.length;
            for ( var i = 0; i < length; ++i) {
                var cartographic = positions[i];

                cartesians.push(this.toCartesian(
                        new Cartographic3(
                                CesiumMath.toRadians(cartographic.longitude),
                                CesiumMath.toRadians(cartographic.latitude),
                                cartographic.height || 0.0)));
            }

            return cartesians;
        }
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param {Cartesian3} positionOnSurface DOC_TBA
     * @return {Cartographic2} DOC_TBA
     */
    Ellipsoid.prototype.toCartographic2 = function(positionOnSurface) {
        var p = Cartesian3.clone(positionOnSurface);
        var n = this.geodeticSurfaceNormal(p);
        return new Cartographic2(
                Math.atan2(n.y, n.x),
                Math.asin(n.z / n.magnitude()));
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param {Cartesian3} position DOC_TBA
     * @return {Cartographic3} DOC_TBA
     */
    Ellipsoid.prototype.toCartographic3 = function(position) {
        var pos = Cartesian3.clone(position);
        var p = this.scaleToGeodeticSurface(pos);
        var h = position.subtract(p);
        var height = CesiumMath.sign(h.dot(pos)) * h.magnitude();
        var c = this.toCartographic2(p);
        return new Cartographic3(c.longitude, c.latitude, height);
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     */
    Ellipsoid.prototype.toCartographic3s = function(positions) {
        if (positions) {
            var cartographics = [];

            var length = positions.length;
            for ( var i = 0; i < length; ++i) {
                cartographics.push(this.toCartographic3(positions[i]));
            }

            return cartographics;
        }
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param {Cartesian3} position DOC_TBA
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.scaleToGeodeticSurface = function(position) {
        var pos = Cartesian3.clone(position);
        var positionX = position.x;
        var positionY = position.y;
        var positionZ = position.z;

        var oneOverRadiiSquared = this.getOneOverRadiiSquared();
        var oneOverRadiiSquaredX = oneOverRadiiSquared.x;
        var oneOverRadiiSquaredY = oneOverRadiiSquared.y;
        var oneOverRadiiSquaredZ = oneOverRadiiSquared.z;

        var radiiSquared = this.getRadiiSquared();
        var radiiSquaredX = radiiSquared.x;
        var radiiSquaredY = radiiSquared.y;
        var radiiSquaredZ = radiiSquared.z;

        var radiiToTheFourth = this.getRadiiToTheFourth();
        var radiiToTheFourthX = radiiToTheFourth.x;
        var radiiToTheFourthY = radiiToTheFourth.y;
        var radiiToTheFourthZ = radiiToTheFourth.z;

        var beta = 1.0 / Math.sqrt(
                (positionX * positionX) * oneOverRadiiSquaredX +
                (positionY * positionY) * oneOverRadiiSquaredY +
                (positionZ * positionZ) * oneOverRadiiSquaredZ);
        var n = new Cartesian3(
                beta * positionX * oneOverRadiiSquaredX,
                beta * positionY * oneOverRadiiSquaredY,
                beta * positionZ * oneOverRadiiSquaredZ).magnitude();
        var alpha = (1.0 - beta) * (pos.magnitude() / n);

        var x2 = positionX * positionX;
        var y2 = positionY * positionY;
        var z2 = positionZ * positionZ;

        var da = 0.0;
        var db = 0.0;
        var dc = 0.0;

        var s = 0.0;
        var dSdA = 1.0;

        do {
            alpha -= (s / dSdA);

            da = 1.0 + (alpha * oneOverRadiiSquaredX);
            db = 1.0 + (alpha * oneOverRadiiSquaredY);
            dc = 1.0 + (alpha * oneOverRadiiSquaredZ);

            var da2 = da * da;
            var db2 = db * db;
            var dc2 = dc * dc;

            var da3 = da * da2;
            var db3 = db * db2;
            var dc3 = dc * dc2;

            s = x2 / (radiiSquaredX * da2) +
                y2 / (radiiSquaredY * db2) +
                z2 / (radiiSquaredZ * dc2) - 1.0;

            dSdA = -2.0 *
                    (x2 / (radiiToTheFourthX * da3) +
                     y2 / (radiiToTheFourthY * db3) +
                     z2 / (radiiToTheFourthZ * dc3));
        } while (Math.abs(s) > CesiumMath.EPSILON10);

        return new Cartesian3(
                positionX / da,
                positionY / db,
                positionZ / dc);
    };

    /**
     * DOC_TBA
     *
     * @memberof Ellipsoid
     *
     * @param {Cartesian3} position DOC_TBA
     * @return {Cartesian3} DOC_TBA
     */
    Ellipsoid.prototype.scaleToGeocentricSurface = function(position) {
        var pos = Cartesian3.clone(position);
        var positionX = position.x;
        var positionY = position.y;
        var positionZ = position.z;
        var oneOverRadiiSquared = this.getOneOverRadiiSquared();

        var beta = 1.0 / Math.sqrt(
                (positionX * positionX) * oneOverRadiiSquared.x +
                (positionY * positionY) * oneOverRadiiSquared.y +
                (positionZ * positionZ) * oneOverRadiiSquared.z);

        return pos.multiplyWithScalar(beta);
    };

    /**
     * Returns <code>true</code> if this ellipsoid equals <code>other</code>, meaning their radii are equal.
     *
     * @memberof Ellipsoid
     *
     * @param {Ellipsoid} other The Ellipsoid to compare for equality.
     *
     * @return {Boolean} <code>true</code> if the ellipsoids are equal; otherwise, <code>false</code>.
     */
    Ellipsoid.prototype.equals = function(other) {
        return this._radii.equals(other._radii);
    };

    return Ellipsoid;
});
