/*! Leaflet.markercluster 1.5.3; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
window.Leaflet = window.Leaflet || {};
window.Leaflet.markercluster = mc_e;
L.MarkerClusterGroup.include({
  _spiderfied: null,
  unspiderfy: function () {
    this._unspiderfy.apply(this, arguments);
  },
  _spiderfierOnAdd: function () {
    this._map.on("click", this._unspiderfyWrapper, this),
      this._map.options.zoomAnimation &&
        this._map.on("zoomstart", this._unspiderfyZoomStart, this),
      this._map.on("zoomend", this._noanimationUnspiderfy, this),
      L.Browser.touch || this._map.getRenderer(this);
  },
  _spiderfierOnRemove: function () {
    this._map.off("click", this._unspiderfyWrapper, this),
      this._map.off("zoomstart", this._unspiderfyZoomStart, this),
      this._map.off("zoomanim", this._unspiderfyZoomAnim, this),
      this._map.off("zoomend", this._noanimationUnspiderfy, this),
      this._noanimationUnspiderfy();
  },
  _unspiderfyZoomStart: function () {
    this._map && this._map.on("zoomanim", this._unspiderfyZoomAnim, this);
  },
  _unspiderfyZoomAnim: function (e) {
    L.DomUtil.hasClass(this._map._mapPane, "leaflet-touching") ||
      (this._map.off("zoomanim", this._unspiderfyZoomAnim, this),
      this._unspiderfy(e));
  },
  _unspiderfyWrapper: function () {
    this._unspiderfy();
  },
  _unspiderfy: function (e) {
    this._spiderfied && this._spiderfied.unspiderfy(e);
  },
  _noanimationUnspiderfy: function () {
    this._spiderfied && this._spiderfied._noanimationUnspiderfy();
  },
  _unspiderfyLayer: function (e) {
    e._spiderLeg &&
      (this._featureGroup.removeLayer(e),
      e.clusterShow && e.clusterShow(),
      e.setZIndexOffset && e.setZIndexOffset(0),
      this._map.removeLayer(e._spiderLeg),
      delete e._spiderLeg);
  },
});
L.MarkerClusterGroup.include({
  refreshClusters: function (e) {
    return (
      e
        ? e instanceof L.MarkerClusterGroup
          ? (e = e._topClusterLevel.getAllChildMarkers())
          : e instanceof L.LayerGroup
            ? (e = e._layers)
            : e instanceof L.MarkerCluster
              ? (e = e.getAllChildMarkers())
              : e instanceof L.Marker && (e = [e])
        : (e = this._topClusterLevel.getAllChildMarkers()),
      this._flagParentsIconsNeedUpdate(e),
      this._refreshClustersIcons(),
      this.options.singleMarkerMode && this._refreshSingleMarkerModeMarkers(e),
      this
    );
  },
  _flagParentsIconsNeedUpdate: function (e) {
    var t, i;
    for (t in e)
      for (i = e[t].__parent; i; ) (i._iconNeedsUpdate = !0), (i = i.__parent);
  },
  _refreshSingleMarkerModeMarkers: function (e) {
    var t, i;
    for (t in e)
      (i = e[t]), this.hasLayer(i) && i.setIcon(this._overrideMarkerIcon(i));
  },
});
L.Marker.include({
  refreshIconOptions: function (e, t) {
    var i = this.options.icon;
    return (
      L.setOptions(i, e),
      this.setIcon(i),
      t && this.__parent && this.__parent._group.refreshClusters(this),
      this
    );
  },
});
mc_e.MarkerClusterGroup = mc_t;
mc_e.MarkerCluster = mc_i;
Object.defineProperty(mc_e, "__esModule", {
  value: !0,
});
