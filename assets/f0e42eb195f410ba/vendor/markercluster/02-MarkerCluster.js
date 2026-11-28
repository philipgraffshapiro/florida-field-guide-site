/*! Leaflet.markercluster 1.5.3; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
L.MarkerClusterGroup.include({
  _noAnimation: {
    _animationStart: function () {},
    _animationZoomIn: function (e, t) {
      this._topClusterLevel._recursivelyRemoveChildrenFromMap(
        this._currentShownBounds,
        Math.floor(this._map.getMinZoom()),
        e,
      ),
        this._topClusterLevel._recursivelyAddChildrenToMap(
          null,
          t,
          this._getExpandedVisibleBounds(),
        ),
        this.fire("animationend");
    },
    _animationZoomOut: function (e, t) {
      this._topClusterLevel._recursivelyRemoveChildrenFromMap(
        this._currentShownBounds,
        Math.floor(this._map.getMinZoom()),
        e,
      ),
        this._topClusterLevel._recursivelyAddChildrenToMap(
          null,
          t,
          this._getExpandedVisibleBounds(),
        ),
        this.fire("animationend");
    },
    _animationAddLayer: function (e, t) {
      this._animationAddLayerNonAnimated(e, t);
    },
  },
  _withAnimation: {
    _animationStart: function () {
      (this._map._mapPane.className += " leaflet-cluster-anim"),
        this._inZoomAnimation++;
    },
    _animationZoomIn: function (n, s) {
      var o,
        a = this._getExpandedVisibleBounds(),
        h = this._featureGroup,
        e = Math.floor(this._map.getMinZoom());
      (this._ignoreMove = !0),
        this._topClusterLevel._recursively(a, n, e, function (e) {
          var t,
            i = e._latlng,
            r = e._markers;
          for (
            a.contains(i) || (i = null),
              e._isSingleParent() && n + 1 === s
                ? (h.removeLayer(e), e._recursivelyAddChildrenToMap(null, s, a))
                : (e.clusterHide(), e._recursivelyAddChildrenToMap(i, s, a)),
              o = r.length - 1;
            0 <= o;
            o--
          )
            (t = r[o]), a.contains(t._latlng) || h.removeLayer(t);
        }),
        this._forceLayout(),
        this._topClusterLevel._recursivelyBecomeVisible(a, s),
        h.eachLayer(function (e) {
          e instanceof L.MarkerCluster || !e._icon || e.clusterShow();
        }),
        this._topClusterLevel._recursively(a, n, s, function (e) {
          e._recursivelyRestoreChildPositions(s);
        }),
        (this._ignoreMove = !1),
        this._enqueue(function () {
          this._topClusterLevel._recursively(a, n, e, function (e) {
            h.removeLayer(e), e.clusterShow();
          }),
            this._animationEnd();
        });
    },
    _animationZoomOut: function (e, t) {
      this._animationZoomOutSingle(this._topClusterLevel, e - 1, t),
        this._topClusterLevel._recursivelyAddChildrenToMap(
          null,
          t,
          this._getExpandedVisibleBounds(),
        ),
        this._topClusterLevel._recursivelyRemoveChildrenFromMap(
          this._currentShownBounds,
          Math.floor(this._map.getMinZoom()),
          e,
          this._getExpandedVisibleBounds(),
        );
    },
    _animationAddLayer: function (e, t) {
      var i = this,
        r = this._featureGroup;
      r.addLayer(e),
        t !== e &&
          (2 < t._childCount
            ? (t._updateIcon(),
              this._forceLayout(),
              this._animationStart(),
              e._setPos(this._map.latLngToLayerPoint(t.getLatLng())),
              e.clusterHide(),
              this._enqueue(function () {
                r.removeLayer(e), e.clusterShow(), i._animationEnd();
              }))
            : (this._forceLayout(),
              i._animationStart(),
              i._animationZoomOutSingle(
                t,
                this._map.getMaxZoom(),
                this._zoom,
              )));
    },
  },
  _animationZoomOutSingle: function (t, i, r) {
    var n = this._getExpandedVisibleBounds(),
      s = Math.floor(this._map.getMinZoom());
    t._recursivelyAnimateChildrenInAndAddSelfToMap(n, s, i + 1, r);
    var o = this;
    this._forceLayout(),
      t._recursivelyBecomeVisible(n, r),
      this._enqueue(function () {
        if (1 === t._childCount) {
          var e = t._markers[0];
          (this._ignoreMove = !0),
            e.setLatLng(e.getLatLng()),
            (this._ignoreMove = !1),
            e.clusterShow && e.clusterShow();
        } else
          t._recursively(n, r, s, function (e) {
            e._recursivelyRemoveChildrenFromMap(n, s, i + 1);
          });
        o._animationEnd();
      });
  },
  _animationEnd: function () {
    this._map &&
      (this._map._mapPane.className = this._map._mapPane.className.replace(
        " leaflet-cluster-anim",
        "",
      )),
      this._inZoomAnimation--,
      this.fire("animationend");
  },
  _forceLayout: function () {
    L.Util.falseFn(document.body.offsetWidth);
  },
});
L.markerClusterGroup = function (e) {
  return new L.MarkerClusterGroup(e);
};
var mc_i = (L.MarkerCluster = L.Marker.extend({
  options: L.Icon.prototype.options,
  initialize: function (e, t, i, r) {
    L.Marker.prototype.initialize.call(
      this,
      i ? i._cLatLng || i.getLatLng() : new L.LatLng(0, 0),
      {
        icon: this,
        pane: e.options.clusterPane,
      },
    ),
      (this._group = e),
      (this._zoom = t),
      (this._markers = []),
      (this._childClusters = []),
      (this._childCount = 0),
      (this._iconNeedsUpdate = !0),
      (this._boundsNeedUpdate = !0),
      (this._bounds = new L.LatLngBounds()),
      i && this._addChild(i),
      r && this._addChild(r);
  },
  getAllChildMarkers: function (e, t) {
    e = e || [];
    for (var i = this._childClusters.length - 1; 0 <= i; i--)
      this._childClusters[i].getAllChildMarkers(e, t);
    for (var r = this._markers.length - 1; 0 <= r; r--)
      (t && this._markers[r].__dragStart) || e.push(this._markers[r]);
    return e;
  },
  getChildCount: function () {
    return this._childCount;
  },
  zoomToBounds: function (e) {
    for (
      var t,
        i = this._childClusters.slice(),
        r = this._group._map,
        n = r.getBoundsZoom(this._bounds),
        s = this._zoom + 1,
        o = r.getZoom();
      0 < i.length && s < n;
    ) {
      s++;
      var a = [];
      for (t = 0; t < i.length; t++) a = a.concat(i[t]._childClusters);
      i = a;
    }
    s < n
      ? this._group._map.setView(this._latlng, s)
      : n <= o
        ? this._group._map.setView(this._latlng, o + 1)
        : this._group._map.fitBounds(this._bounds, e);
  },
  getBounds: function () {
    var e = new L.LatLngBounds();
    return e.extend(this._bounds), e;
  },
  _updateIcon: function () {
    (this._iconNeedsUpdate = !0), this._icon && this.setIcon(this);
  },
  createIcon: function () {
    return (
      this._iconNeedsUpdate &&
        ((this._iconObj = this._group.options.iconCreateFunction(this)),
        (this._iconNeedsUpdate = !1)),
      this._iconObj.createIcon()
    );
  },
  createShadow: function () {
    return this._iconObj.createShadow();
  },
  _addChild: function (e, t) {
    (this._iconNeedsUpdate = !0),
      (this._boundsNeedUpdate = !0),
      this._setClusterCenter(e),
      e instanceof L.MarkerCluster
        ? (t || (this._childClusters.push(e), (e.__parent = this)),
          (this._childCount += e._childCount))
        : (t || this._markers.push(e), this._childCount++),
      this.__parent && this.__parent._addChild(e, !0);
  },
  _setClusterCenter: function (e) {
    this._cLatLng || (this._cLatLng = e._cLatLng || e._latlng);
  },
  _resetBounds: function () {
    var e = this._bounds;
    e._southWest && ((e._southWest.lat = 1 / 0), (e._southWest.lng = 1 / 0)),
      e._northEast &&
        ((e._northEast.lat = -1 / 0), (e._northEast.lng = -1 / 0));
  },
  _recalculateBounds: function () {
    var e,
      t,
      i,
      r,
      n = this._markers,
      s = this._childClusters,
      o = 0,
      a = 0,
      h = this._childCount;
    if (0 !== h) {
      for (this._resetBounds(), e = 0; e < n.length; e++)
        (i = n[e]._latlng), this._bounds.extend(i), (o += i.lat), (a += i.lng);
      for (e = 0; e < s.length; e++)
        (t = s[e])._boundsNeedUpdate && t._recalculateBounds(),
          this._bounds.extend(t._bounds),
          (i = t._wLatLng),
          (r = t._childCount),
          (o += i.lat * r),
          (a += i.lng * r);
      (this._latlng = this._wLatLng = new L.LatLng(o / h, a / h)),
        (this._boundsNeedUpdate = !1);
    }
  },
  _addToMap: function (e) {
    e && ((this._backupLatlng = this._latlng), this.setLatLng(e)),
      this._group._featureGroup.addLayer(this);
  },
  _recursivelyAnimateChildrenIn: function (e, n, t) {
    this._recursively(
      e,
      this._group._map.getMinZoom(),
      t - 1,
      function (e) {
        var t,
          i,
          r = e._markers;
        for (t = r.length - 1; 0 <= t; t--)
          (i = r[t])._icon && (i._setPos(n), i.clusterHide());
      },
      function (e) {
        var t,
          i,
          r = e._childClusters;
        for (t = r.length - 1; 0 <= t; t--)
          (i = r[t])._icon && (i._setPos(n), i.clusterHide());
      },
    );
  },
  _recursivelyAnimateChildrenInAndAddSelfToMap: function (t, i, r, n) {
    this._recursively(t, n, i, function (e) {
      e._recursivelyAnimateChildrenIn(
        t,
        e._group._map.latLngToLayerPoint(e.getLatLng()).round(),
        r,
      ),
        e._isSingleParent() && r - 1 === n
          ? (e.clusterShow(), e._recursivelyRemoveChildrenFromMap(t, i, r))
          : e.clusterHide(),
        e._addToMap();
    });
  },
  _recursivelyBecomeVisible: function (e, t) {
    this._recursively(e, this._group._map.getMinZoom(), t, null, function (e) {
      e.clusterShow();
    });
  },
  _recursivelyAddChildrenToMap: function (r, n, s) {
    this._recursively(
      s,
      this._group._map.getMinZoom() - 1,
      n,
      function (e) {
        if (n !== e._zoom)
          for (var t = e._markers.length - 1; 0 <= t; t--) {
            var i = e._markers[t];
            s.contains(i._latlng) &&
              (r &&
                ((i._backupLatlng = i.getLatLng()),
                i.setLatLng(r),
                i.clusterHide && i.clusterHide()),
              e._group._featureGroup.addLayer(i));
          }
      },
      function (e) {
        e._addToMap(r);
      },
    );
  },
  _recursivelyRestoreChildPositions: function (e) {
    for (var t = this._markers.length - 1; 0 <= t; t--) {
      var i = this._markers[t];
      i._backupLatlng && (i.setLatLng(i._backupLatlng), delete i._backupLatlng);
    }
    if (e - 1 === this._zoom)
      for (var r = this._childClusters.length - 1; 0 <= r; r--)
        this._childClusters[r]._restorePosition();
    else
      for (var n = this._childClusters.length - 1; 0 <= n; n--)
        this._childClusters[n]._recursivelyRestoreChildPositions(e);
  },
  _restorePosition: function () {
    this._backupLatlng &&
      (this.setLatLng(this._backupLatlng), delete this._backupLatlng);
  },
  _recursivelyRemoveChildrenFromMap: function (e, t, i, r) {
    var n, s;
    this._recursively(
      e,
      t - 1,
      i - 1,
      function (e) {
        for (s = e._markers.length - 1; 0 <= s; s--)
          (n = e._markers[s]),
            (r && r.contains(n._latlng)) ||
              (e._group._featureGroup.removeLayer(n),
              n.clusterShow && n.clusterShow());
      },
      function (e) {
        for (s = e._childClusters.length - 1; 0 <= s; s--)
          (n = e._childClusters[s]),
            (r && r.contains(n._latlng)) ||
              (e._group._featureGroup.removeLayer(n),
              n.clusterShow && n.clusterShow());
      },
    );
  },
  _recursively: function (e, t, i, r, n) {
    var s,
      o,
      a = this._childClusters,
      h = this._zoom;
    if ((t <= h && (r && r(this), n && h === i && n(this)), h < t || h < i))
      for (s = a.length - 1; 0 <= s; s--)
        (o = a[s])._boundsNeedUpdate && o._recalculateBounds(),
          e.intersects(o._bounds) && o._recursively(e, t, i, r, n);
  },
  _isSingleParent: function () {
    return (
      0 < this._childClusters.length &&
      this._childClusters[0]._childCount === this._childCount
    );
  },
}));
L.Marker.include({
  clusterHide: function () {
    var e = this.options.opacity;
    return this.setOpacity(0), (this.options.opacity = e), this;
  },
  clusterShow: function () {
    return this.setOpacity(this.options.opacity);
  },
});
L.DistanceGrid = function (e) {
  (this._cellSize = e),
    (this._sqCellSize = e * e),
    (this._grid = {}),
    (this._objectPoint = {});
};
