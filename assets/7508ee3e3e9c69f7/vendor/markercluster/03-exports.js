/*! Leaflet.markercluster 1.5.3; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
L.DistanceGrid.prototype = {
  addObject: function (e, t) {
    var i = this._getCoord(t.x),
      r = this._getCoord(t.y),
      n = this._grid,
      s = (n[r] = n[r] || {}),
      o = (s[i] = s[i] || []),
      a = L.Util.stamp(e);
    (this._objectPoint[a] = t), o.push(e);
  },
  updateObject: function (e, t) {
    this.removeObject(e), this.addObject(e, t);
  },
  removeObject: function (e, t) {
    var i,
      r,
      n = this._getCoord(t.x),
      s = this._getCoord(t.y),
      o = this._grid,
      a = (o[s] = o[s] || {}),
      h = (a[n] = a[n] || []);
    for (
      delete this._objectPoint[L.Util.stamp(e)], i = 0, r = h.length;
      i < r;
      i++
    )
      if (h[i] === e) return h.splice(i, 1), 1 === r && delete a[n], !0;
  },
  eachObject: function (e, t) {
    var i,
      r,
      n,
      s,
      o,
      a,
      h = this._grid;
    for (i in h)
      for (r in (o = h[i]))
        for (n = 0, s = (a = o[r]).length; n < s; n++)
          e.call(t, a[n]) && (n--, s--);
  },
  getNearObject: function (point) {
    var x = this._getCoord(point.x), y = this._getCoord(point.y);
    var closest = null, closestDist = this._sqCellSize;
    for (var rowIndex = y - 1; rowIndex <= y + 1; rowIndex++) {
      var row = this._grid[rowIndex];
      if (!row) continue;
      for (var column = x - 1; column <= x + 1; column++) {
        var cell = row[column];
        if (!cell) continue;
        for (var index = 0; index < cell.length; index++) {
          var object = cell[index];
          var distance = this._sqDist(this._objectPoint[L.Util.stamp(object)], point);
          if (distance < closestDist || (distance <= closestDist && closest === null)) {
            closestDist = distance;
            closest = object;
          }
        }
      }
    }
    return closest;
  },
  _getCoord: function (e) {
    var t = Math.floor(e / this._cellSize);
    return isFinite(t) ? t : e;
  },
  _sqDist: function (e, t) {
    var i = t.x - e.x,
      r = t.y - e.y;
    return i * i + r * r;
  },
};
L.QuickHull = {
  getDistant: function (e, t) {
    var i = t[1].lat - t[0].lat;
    return (t[0].lng - t[1].lng) * (e.lat - t[0].lat) + i * (e.lng - t[0].lng);
  },
  findMostDistantPointFromBaseLine: function (e, t) {
    var i,
      r,
      n,
      s = 0,
      o = null,
      a = [];
    for (i = t.length - 1; 0 <= i; i--)
      (r = t[i]),
        0 < (n = this.getDistant(r, e)) &&
          (a.push(r), s < n && ((s = n), (o = r)));
    return {
      maxPoint: o,
      newPoints: a,
    };
  },
  buildConvexHull: function (e, t) {
    var i = [],
      r = this.findMostDistantPointFromBaseLine(e, t);
    return r.maxPoint
      ? (i = (i = i.concat(
          this.buildConvexHull([e[0], r.maxPoint], r.newPoints),
        )).concat(this.buildConvexHull([r.maxPoint, e[1]], r.newPoints)))
      : [e[0]];
  },
  getConvexHull: function (e) {
    var t,
      i = !1,
      r = !1,
      n = !1,
      s = !1,
      o = null,
      a = null,
      h = null,
      l = null,
      u = null,
      _ = null;
    for (t = e.length - 1; 0 <= t; t--) {
      var d = e[t];
      (!1 === i || d.lat > i) && (i = (o = d).lat),
        (!1 === r || d.lat < r) && (r = (a = d).lat),
        (!1 === n || d.lng > n) && (n = (h = d).lng),
        (!1 === s || d.lng < s) && (s = (l = d).lng);
    }
    return (
      (u = r !== i ? ((_ = a), o) : ((_ = l), h)),
      [].concat(
        this.buildConvexHull([_, u], e),
        this.buildConvexHull([u, _], e),
      )
    );
  },
};
L.MarkerCluster.include({
  getConvexHull: function () {
    var e,
      t,
      i = this.getAllChildMarkers(),
      r = [];
    for (t = i.length - 1; 0 <= t; t--) (e = i[t].getLatLng()), r.push(e);
    return L.QuickHull.getConvexHull(r);
  },
});
L.MarkerCluster.include({
  _2PI: 2 * Math.PI,
  _circleFootSeparation: 25,
  _circleStartAngle: 0,
  _spiralFootSeparation: 28,
  _spiralLengthStart: 11,
  _spiralLengthFactor: 5,
  _circleSpiralSwitchover: 9,
  spiderfy: function () {
    if (this._group._spiderfied !== this && !this._group._inZoomAnimation) {
      var e,
        t = this.getAllChildMarkers(null, !0),
        i = this._group._map.latLngToLayerPoint(this._latlng);
      this._group._unspiderfy(),
        (e = (this._group._spiderfied = this)._group.options
          .spiderfyShapePositions
          ? this._group.options.spiderfyShapePositions(t.length, i)
          : t.length >= this._circleSpiralSwitchover
            ? this._generatePointsSpiral(t.length, i)
            : ((i.y += 10), this._generatePointsCircle(t.length, i))),
        this._animationSpiderfy(t, e);
    }
  },
  unspiderfy: function (e) {
    this._group._inZoomAnimation ||
      (this._animationUnspiderfy(e), (this._group._spiderfied = null));
  },
  _generatePointsCircle: function (e, t) {
    var i,
      r,
      n =
        (this._group.options.spiderfyDistanceMultiplier *
          this._circleFootSeparation *
          (2 + e)) /
        this._2PI,
      s = this._2PI / e,
      o = [];
    for (n = Math.max(n, 35), o.length = e, i = 0; i < e; i++)
      (r = this._circleStartAngle + i * s),
        (o[i] = new L.Point(
          t.x + n * Math.cos(r),
          t.y + n * Math.sin(r),
        )._round());
    return o;
  },
  _generatePointsSpiral: function (e, t) {
    var i,
      r = this._group.options.spiderfyDistanceMultiplier,
      n = r * this._spiralLengthStart,
      s = r * this._spiralFootSeparation,
      o = r * this._spiralLengthFactor * this._2PI,
      a = 0,
      h = [];
    for (i = h.length = e; 0 <= i; i--)
      i < e &&
        (h[i] = new L.Point(
          t.x + n * Math.cos(a),
          t.y + n * Math.sin(a),
        )._round()),
        (n += o / (a += s / n + 5e-4 * i));
    return h;
  },
  _noanimationUnspiderfy: function () {
    var e,
      t,
      i = this._group,
      r = i._map,
      n = i._featureGroup,
      s = this.getAllChildMarkers(null, !0);
    for (i._ignoreMove = !0, this.setOpacity(1), t = s.length - 1; 0 <= t; t--)
      (e = s[t]),
        n.removeLayer(e),
        e._preSpiderfyLatlng &&
          (e.setLatLng(e._preSpiderfyLatlng), delete e._preSpiderfyLatlng),
        e.setZIndexOffset && e.setZIndexOffset(0),
        e._spiderLeg && (r.removeLayer(e._spiderLeg), delete e._spiderLeg);
    i.fire("unspiderfied", {
      cluster: this,
      markers: s,
    }),
      (i._ignoreMove = !1),
      (i._spiderfied = null);
  },
});
L.MarkerClusterNonAnimated = L.MarkerCluster.extend({
  _animationSpiderfy: function (e, t) {
    var i,
      r,
      n,
      s,
      o = this._group,
      a = o._map,
      h = o._featureGroup,
      l = this._group.options.spiderLegPolylineOptions;
    for (o._ignoreMove = !0, i = 0; i < e.length; i++)
      (s = a.layerPointToLatLng(t[i])),
        (r = e[i]),
        (n = new L.Polyline([this._latlng, s], l)),
        a.addLayer(n),
        (r._spiderLeg = n),
        (r._preSpiderfyLatlng = r._latlng),
        r.setLatLng(s),
        r.setZIndexOffset && r.setZIndexOffset(1e6),
        h.addLayer(r);
    this.setOpacity(0.3),
      (o._ignoreMove = !1),
      o.fire("spiderfied", {
        cluster: this,
        markers: e,
      });
  },
  _animationUnspiderfy: function () {
    this._noanimationUnspiderfy();
  },
});
L.MarkerCluster.include({
  _animationSpiderfy: function (e, t) {
    var i,
      r,
      n,
      s,
      o,
      a,
      h = this,
      l = this._group,
      u = l._map,
      _ = l._featureGroup,
      d = this._latlng,
      p = u.latLngToLayerPoint(d),
      c = L.Path.SVG,
      f = L.extend({}, this._group.options.spiderLegPolylineOptions),
      m = f.opacity;
    for (
      void 0 === m &&
        (m =
          L.MarkerClusterGroup.prototype.options.spiderLegPolylineOptions
            .opacity),
        c
          ? ((f.opacity = 0),
            (f.className = (f.className || "") + " leaflet-cluster-spider-leg"))
          : (f.opacity = m),
        l._ignoreMove = !0,
        i = 0;
      i < e.length;
      i++
    )
      (r = e[i]),
        (a = u.layerPointToLatLng(t[i])),
        (n = new L.Polyline([d, a], f)),
        u.addLayer(n),
        (r._spiderLeg = n),
        c &&
          ((o = (s = n._path).getTotalLength() + 0.1),
          (s.style.strokeDasharray = o),
          (s.style.strokeDashoffset = o)),
        r.setZIndexOffset && r.setZIndexOffset(1e6),
        r.clusterHide && r.clusterHide(),
        _.addLayer(r),
        r._setPos && r._setPos(p);
    for (l._forceLayout(), l._animationStart(), i = e.length - 1; 0 <= i; i--)
      (a = u.layerPointToLatLng(t[i])),
        ((r = e[i])._preSpiderfyLatlng = r._latlng),
        r.setLatLng(a),
        r.clusterShow && r.clusterShow(),
        c &&
          (((s = (n = r._spiderLeg)._path).style.strokeDashoffset = 0),
          n.setStyle({
            opacity: m,
          }));
    this.setOpacity(0.3),
      (l._ignoreMove = !1),
      setTimeout(function () {
        l._animationEnd(),
          l.fire("spiderfied", {
            cluster: h,
            markers: e,
          });
      }, 200);
  },
  _animationUnspiderfy: function (e) {
    var t,
      i,
      r,
      n,
      s,
      o,
      a = this,
      h = this._group,
      l = h._map,
      u = h._featureGroup,
      _ = e
        ? l._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
        : l.latLngToLayerPoint(this._latlng),
      d = this.getAllChildMarkers(null, !0),
      p = L.Path.SVG;
    for (
      h._ignoreMove = !0,
        h._animationStart(),
        this.setOpacity(1),
        i = d.length - 1;
      0 <= i;
      i--
    )
      (t = d[i])._preSpiderfyLatlng &&
        (t.closePopup(),
        t.setLatLng(t._preSpiderfyLatlng),
        delete t._preSpiderfyLatlng,
        (o = !0),
        t._setPos && (t._setPos(_), (o = !1)),
        t.clusterHide && (t.clusterHide(), (o = !1)),
        o && u.removeLayer(t),
        p &&
          ((s = (n = (r = t._spiderLeg)._path).getTotalLength() + 0.1),
          (n.style.strokeDashoffset = s),
          r.setStyle({
            opacity: 0,
          })));
    (h._ignoreMove = !1),
      setTimeout(function () {
        var e = 0;
        for (i = d.length - 1; 0 <= i; i--) (t = d[i])._spiderLeg && e++;
        for (i = d.length - 1; 0 <= i; i--)
          (t = d[i])._spiderLeg &&
            (t.clusterShow && t.clusterShow(),
            t.setZIndexOffset && t.setZIndexOffset(0),
            1 < e && u.removeLayer(t),
            l.removeLayer(t._spiderLeg),
            delete t._spiderLeg);
        h._animationEnd(),
          h.fire("unspiderfied", {
            cluster: a,
            markers: d,
          });
      }, 200);
  },
});
