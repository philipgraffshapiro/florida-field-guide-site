/*! Leaflet.markercluster 1.5.3; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var mc_MarkerClusterGroup_zoomToShowLayer = {
  zoomToShowLayer: function (e, t) {
    var i = this._map;
    "function" != typeof t && (t = function () {});
    var r = function () {
      (!i.hasLayer(e) && !i.hasLayer(e.__parent)) ||
        this._inZoomAnimation ||
        (this._map.off("moveend", r, this),
        this.off("animationend", r, this),
        i.hasLayer(e)
          ? t()
          : e.__parent._icon &&
            (this.once("spiderfied", t, this), e.__parent.spiderfy()));
    };
    e._icon && this._map.getBounds().contains(e.getLatLng())
      ? t()
      : e.__parent._zoom < Math.round(this._map._zoom)
        ? (this._map.on("moveend", r, this), this._map.panTo(e.getLatLng()))
        : (this._map.on("moveend", r, this),
          this.on("animationend", r, this),
          e.__parent.zoomToBounds());
  },
  onAdd: function (e) {
    var t, i, r;
    if (((this._map = e), !isFinite(this._map.getMaxZoom())))
      throw "Map has no maxZoom specified";
    for (
      this._featureGroup.addTo(e),
        this._nonPointGroup.addTo(e),
        this._gridClusters || this._generateInitialClusters(),
        this._maxLat = e.options.crs.projection.MAX_LATITUDE,
        t = 0,
        i = this._needsRemoving.length;
      t < i;
      t++
    )
      ((r = this._needsRemoving[t]).newlatlng = r.layer._latlng),
        (r.layer._latlng = r.latlng);
    for (t = 0, i = this._needsRemoving.length; t < i; t++)
      (r = this._needsRemoving[t]),
        this._removeLayer(r.layer, !0),
        (r.layer._latlng = r.newlatlng);
    (this._needsRemoving = []),
      (this._zoom = Math.round(this._map._zoom)),
      (this._currentShownBounds = this._getExpandedVisibleBounds()),
      this._map.on("zoomend", this._zoomEnd, this),
      this._map.on("moveend", this._moveEnd, this),
      this._spiderfierOnAdd && this._spiderfierOnAdd(),
      this._bindEvents(),
      (i = this._needsClustering),
      (this._needsClustering = []),
      this.addLayers(i, !0);
  },
  onRemove: function (e) {
    e.off("zoomend", this._zoomEnd, this),
      e.off("moveend", this._moveEnd, this),
      this._unbindEvents(),
      (this._map._mapPane.className = this._map._mapPane.className.replace(
        " leaflet-cluster-anim",
        "",
      )),
      this._spiderfierOnRemove && this._spiderfierOnRemove(),
      delete this._maxLat,
      this._hideCoverage(),
      this._featureGroup.remove(),
      this._nonPointGroup.remove(),
      this._featureGroup.clearLayers(),
      (this._map = null);
  },
  getVisibleParent: function (e) {
    for (var t = e; t && !t._icon; ) t = t.__parent;
    return t || null;
  },
  _arraySplice: function (e, t) {
    for (var i = e.length - 1; 0 <= i; i--)
      if (e[i] === t) return e.splice(i, 1), !0;
  },
  _removeFromGridUnclustered: function (e, t) {
    for (
      var i = this._map,
        r = this._gridUnclustered,
        n = Math.floor(this._map.getMinZoom());
      n <= t && r[t].removeObject(e, i.project(e.getLatLng(), t));
      t--
    );
  },
  _childMarkerDragStart: function (e) {
    e.target.__dragStart = e.target._latlng;
  },
  _childMarkerMoved: function (e) {
    if (!this._ignoreMove && !e.target.__dragStart) {
      var t = e.target._popup && e.target._popup.isOpen();
      this._moveChild(e.target, e.oldLatLng, e.latlng),
        t && e.target.openPopup();
    }
  },
  _moveChild: function (e, t, i) {
    (e._latlng = t), this.removeLayer(e), (e._latlng = i), this.addLayer(e);
  },
  _childMarkerDragEnd: function (e) {
    var t = e.target.__dragStart;
    delete e.target.__dragStart,
      t && this._moveChild(e.target, t, e.target._latlng);
  },
  _removeLayer: function (e, t, i) {
    var r = this._gridClusters,
      n = this._gridUnclustered,
      s = this._featureGroup,
      o = this._map,
      a = Math.floor(this._map.getMinZoom());
    t && this._removeFromGridUnclustered(e, this._maxZoom);
    var h,
      l = e.__parent,
      u = l._markers;
    for (
      this._arraySplice(u, e);
      l && (l._childCount--, (l._boundsNeedUpdate = !0), !(l._zoom < a));
    )
      t && l._childCount <= 1
        ? ((h = l._markers[0] === e ? l._markers[1] : l._markers[0]),
          r[l._zoom].removeObject(l, o.project(l._cLatLng, l._zoom)),
          n[l._zoom].addObject(h, o.project(h.getLatLng(), l._zoom)),
          this._arraySplice(l.__parent._childClusters, l),
          l.__parent._markers.push(h),
          (h.__parent = l.__parent),
          l._icon && (s.removeLayer(l), i || s.addLayer(h)))
        : (l._iconNeedsUpdate = !0),
        (l = l.__parent);
    delete e.__parent;
  },
  _isOrIsParent: function (e, t) {
    for (; t; ) {
      if (e === t) return !0;
      t = t.parentNode;
    }
    return !1;
  },
  fire: function (e, t, i) {
    if (t && t.layer instanceof L.MarkerCluster) {
      if (
        t.originalEvent &&
        this._isOrIsParent(t.layer._icon, t.originalEvent.relatedTarget)
      )
        return;
      e = "cluster" + e;
    }
    L.FeatureGroup.prototype.fire.call(this, e, t, i);
  },
  listens: function (e, t) {
    return (
      L.FeatureGroup.prototype.listens.call(this, e, t) ||
      L.FeatureGroup.prototype.listens.call(this, "cluster" + e, t)
    );
  },
  _defaultIconCreateFunction: function (e) {
    var t = e.getChildCount(),
      i = " marker-cluster-";
    return (
      (i += t < 10 ? "small" : t < 100 ? "medium" : "large"),
      new L.DivIcon({
        html: "<div><span>" + t + "</span></div>",
        className: "marker-cluster" + i,
        iconSize: new L.Point(40, 40),
      })
    );
  },
  _bindEvents: function () {
    var e = this._map,
      t = this.options.spiderfyOnMaxZoom,
      i = this.options.showCoverageOnHover,
      r = this.options.zoomToBoundsOnClick,
      n = this.options.spiderfyOnEveryZoom;
    (t || r || n) &&
      this.on("clusterclick clusterkeypress", this._zoomOrSpiderfy, this),
      i &&
        (this.on("clustermouseover", this._showCoverage, this),
        this.on("clustermouseout", this._hideCoverage, this),
        e.on("zoomend", this._hideCoverage, this));
  },
  _zoomOrSpiderfy: function (e) {
    var t = e.layer,
      i = t;
    if (
      "clusterkeypress" !== e.type ||
      !e.originalEvent ||
      13 === e.originalEvent.keyCode
    ) {
      for (; 1 === i._childClusters.length; ) i = i._childClusters[0];
      i._zoom === this._maxZoom &&
      i._childCount === t._childCount &&
      this.options.spiderfyOnMaxZoom
        ? t.spiderfy()
        : this.options.zoomToBoundsOnClick && t.zoomToBounds(),
        this.options.spiderfyOnEveryZoom && t.spiderfy(),
        e.originalEvent &&
          13 === e.originalEvent.keyCode &&
          this._map._container.focus();
    }
  },
  _showCoverage: function (e) {
    var t = this._map;
    this._inZoomAnimation ||
      (this._shownPolygon && t.removeLayer(this._shownPolygon),
      2 < e.layer.getChildCount() &&
        e.layer !== this._spiderfied &&
        ((this._shownPolygon = new L.Polygon(
          e.layer.getConvexHull(),
          this.options.polygonOptions,
        )),
        t.addLayer(this._shownPolygon)));
  },
  _hideCoverage: function () {
    this._shownPolygon &&
      (this._map.removeLayer(this._shownPolygon), (this._shownPolygon = null));
  },
  _unbindEvents: function () {
    var e = this.options.spiderfyOnMaxZoom,
      t = this.options.showCoverageOnHover,
      i = this.options.zoomToBoundsOnClick,
      r = this.options.spiderfyOnEveryZoom,
      n = this._map;
    (e || i || r) &&
      this.off("clusterclick clusterkeypress", this._zoomOrSpiderfy, this),
      t &&
        (this.off("clustermouseover", this._showCoverage, this),
        this.off("clustermouseout", this._hideCoverage, this),
        n.off("zoomend", this._hideCoverage, this));
  },
  _zoomEnd: function () {
    this._map &&
      (this._mergeSplitClusters(),
      (this._zoom = Math.round(this._map._zoom)),
      (this._currentShownBounds = this._getExpandedVisibleBounds()));
  },
  _moveEnd: function () {
    if (!this._inZoomAnimation) {
      var e = this._getExpandedVisibleBounds();
      this._topClusterLevel._recursivelyRemoveChildrenFromMap(
        this._currentShownBounds,
        Math.floor(this._map.getMinZoom()),
        this._zoom,
        e,
      ),
        this._topClusterLevel._recursivelyAddChildrenToMap(
          null,
          Math.round(this._map._zoom),
          e,
        ),
        (this._currentShownBounds = e);
    }
  },
  _generateInitialClusters: function () {
    var e = Math.ceil(this._map.getMaxZoom()),
      t = Math.floor(this._map.getMinZoom()),
      i = this.options.maxClusterRadius,
      r = i;
    "function" != typeof i &&
      (r = function () {
        return i;
      }),
      null !== this.options.disableClusteringAtZoom &&
        (e = this.options.disableClusteringAtZoom - 1),
      (this._maxZoom = e),
      (this._gridClusters = {}),
      (this._gridUnclustered = {});
    for (var n = e; t <= n; n--)
      (this._gridClusters[n] = new L.DistanceGrid(r(n))),
        (this._gridUnclustered[n] = new L.DistanceGrid(r(n)));
    this._topClusterLevel = new this._markerCluster(this, t - 1);
  },
  _addLayer: function (e, t) {
    var i,
      r,
      n = this._gridClusters,
      s = this._gridUnclustered,
      o = Math.floor(this._map.getMinZoom());
    for (
      this.options.singleMarkerMode && this._overrideMarkerIcon(e),
        e.on(this._childMarkerEventHandlers, this);
      o <= t;
      t--
    ) {
      i = this._map.project(e.getLatLng(), t);
      var a = n[t].getNearObject(i);
      if (a) return a._addChild(e), void (e.__parent = a);
      if ((a = s[t].getNearObject(i))) {
        var h = a.__parent;
        h && this._removeLayer(a, !1);
        var l = new this._markerCluster(this, t, a, e);
        n[t].addObject(l, this._map.project(l._cLatLng, t)), (a.__parent = l);
        var u = (e.__parent = l);
        for (r = t - 1; r > h._zoom; r--)
          (u = new this._markerCluster(this, r, u)),
            n[r].addObject(u, this._map.project(a.getLatLng(), r));
        return h._addChild(u), void this._removeFromGridUnclustered(a, t);
      }
      s[t].addObject(e, i);
    }
    this._topClusterLevel._addChild(e), (e.__parent = this._topClusterLevel);
  },
  _refreshClustersIcons: function () {
    this._featureGroup.eachLayer(function (e) {
      e instanceof L.MarkerCluster && e._iconNeedsUpdate && e._updateIcon();
    });
  },
  _enqueue: function (e) {
    this._queue.push(e),
      this._queueTimeout ||
        (this._queueTimeout = setTimeout(
          L.bind(this._processQueue, this),
          300,
        ));
  },
  _processQueue: function () {
    for (var e = 0; e < this._queue.length; e++) this._queue[e].call(this);
    (this._queue.length = 0),
      clearTimeout(this._queueTimeout),
      (this._queueTimeout = null);
  },
};
var mc_MarkerClusterGroup__mergeSplitClusters = {
  _mergeSplitClusters: function () {
    var e = Math.round(this._map._zoom);
    this._processQueue(),
      this._zoom < e &&
      this._currentShownBounds.intersects(this._getExpandedVisibleBounds())
        ? (this._animationStart(),
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(
            this._currentShownBounds,
            Math.floor(this._map.getMinZoom()),
            this._zoom,
            this._getExpandedVisibleBounds(),
          ),
          this._animationZoomIn(this._zoom, e))
        : this._zoom > e
          ? (this._animationStart(), this._animationZoomOut(this._zoom, e))
          : this._moveEnd();
  },
  _getExpandedVisibleBounds: function () {
    return this.options.removeOutsideVisibleBounds
      ? L.Browser.mobile
        ? this._checkBoundsMaxLat(this._map.getBounds())
        : this._checkBoundsMaxLat(this._map.getBounds().pad(1))
      : this._mapBoundsInfinite;
  },
  _checkBoundsMaxLat: function (e) {
    var t = this._maxLat;
    return (
      void 0 !== t &&
        (e.getNorth() >= t && (e._northEast.lat = 1 / 0),
        e.getSouth() <= -t && (e._southWest.lat = -1 / 0)),
      e
    );
  },
  _animationAddLayerNonAnimated: function (e, t) {
    if (t === e) this._featureGroup.addLayer(e);
    else if (2 === t._childCount) {
      t._addToMap();
      var i = t.getAllChildMarkers();
      this._featureGroup.removeLayer(i[0]),
        this._featureGroup.removeLayer(i[1]);
    } else t._updateIcon();
  },
  _extractNonGroupLayers: function (e, t) {
    var i,
      r = e.getLayers(),
      n = 0;
    for (t = t || []; n < r.length; n++)
      (i = r[n]) instanceof L.LayerGroup
        ? this._extractNonGroupLayers(i, t)
        : t.push(i);
    return t;
  },
  _overrideMarkerIcon: function (e) {
    return (e.options.icon = this.options.iconCreateFunction({
      getChildCount: function () {
        return 1;
      },
      getAllChildMarkers: function () {
        return [e];
      },
    }));
  },
};
var mc_t = (L.MarkerClusterGroup = L.FeatureGroup.extend(
  Object.assign(
    {},
    mc_MarkerClusterGroup_options,
    mc_MarkerClusterGroup_zoomToShowLayer,
    mc_MarkerClusterGroup__mergeSplitClusters,
  ),
));
L.MarkerClusterGroup.include({
  _mapBoundsInfinite: new L.LatLngBounds(
    new L.LatLng(-1 / 0, -1 / 0),
    new L.LatLng(1 / 0, 1 / 0),
  ),
});
