/*! Leaflet.markercluster 1.5.3; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var mc_e = {};
var mc_MarkerClusterGroup_options = {
  options: {
    maxClusterRadius: 80,
    iconCreateFunction: null,
    clusterPane: L.Marker.prototype.options.pane,
    spiderfyOnEveryZoom: !1,
    spiderfyOnMaxZoom: !0,
    showCoverageOnHover: !0,
    zoomToBoundsOnClick: !0,
    singleMarkerMode: !1,
    disableClusteringAtZoom: null,
    removeOutsideVisibleBounds: !0,
    animate: !0,
    animateAddingMarkers: !1,
    spiderfyShapePositions: null,
    spiderfyDistanceMultiplier: 1,
    spiderLegPolylineOptions: {
      weight: 1.5,
      color: "#222",
      opacity: 0.5,
    },
    chunkedLoading: !1,
    chunkInterval: 200,
    chunkDelay: 50,
    chunkProgress: null,
    polygonOptions: {},
  },
  initialize: function (e) {
    L.Util.setOptions(this, e),
      this.options.iconCreateFunction ||
        (this.options.iconCreateFunction = this._defaultIconCreateFunction),
      (this._featureGroup = L.featureGroup()),
      this._featureGroup.addEventParent(this),
      (this._nonPointGroup = L.featureGroup()),
      this._nonPointGroup.addEventParent(this),
      (this._inZoomAnimation = 0),
      (this._needsClustering = []),
      (this._needsRemoving = []),
      (this._currentShownBounds = null),
      (this._queue = []),
      (this._childMarkerEventHandlers = {
        dragstart: this._childMarkerDragStart,
        move: this._childMarkerMoved,
        dragend: this._childMarkerDragEnd,
      });
    var t = L.DomUtil.TRANSITION && this.options.animate;
    L.extend(this, t ? this._withAnimation : this._noAnimation),
      (this._markerCluster = t ? L.MarkerCluster : L.MarkerClusterNonAnimated);
  },
  addLayer: function (e) {
    if (e instanceof L.LayerGroup) return this.addLayers([e]);
    if (!e.getLatLng)
      return (
        this._nonPointGroup.addLayer(e),
        this.fire("layeradd", {
          layer: e,
        }),
        this
      );
    if (!this._map)
      return (
        this._needsClustering.push(e),
        this.fire("layeradd", {
          layer: e,
        }),
        this
      );
    if (this.hasLayer(e)) return this;
    this._unspiderfy && this._unspiderfy(),
      this._addLayer(e, this._maxZoom),
      this.fire("layeradd", {
        layer: e,
      }),
      this._topClusterLevel._recalculateBounds(),
      this._refreshClustersIcons();
    var t = e,
      i = this._zoom;
    if (e.__parent) for (; t.__parent._zoom >= i; ) t = t.__parent;
    return (
      this._currentShownBounds.contains(t.getLatLng()) &&
        (this.options.animateAddingMarkers
          ? this._animationAddLayer(e, t)
          : this._animationAddLayerNonAnimated(e, t)),
      this
    );
  },
  removeLayer: function (e) {
    return e instanceof L.LayerGroup
      ? this.removeLayers([e])
      : (e.getLatLng
          ? this._map
            ? e.__parent &&
              (this._unspiderfy &&
                (this._unspiderfy(), this._unspiderfyLayer(e)),
              this._removeLayer(e, !0),
              this.fire("layerremove", {
                layer: e,
              }),
              this._topClusterLevel._recalculateBounds(),
              this._refreshClustersIcons(),
              e.off(this._childMarkerEventHandlers, this),
              this._featureGroup.hasLayer(e) &&
                (this._featureGroup.removeLayer(e),
                e.clusterShow && e.clusterShow()))
            : (!this._arraySplice(this._needsClustering, e) &&
                this.hasLayer(e) &&
                this._needsRemoving.push({
                  layer: e,
                  latlng: e._latlng,
                }),
              this.fire("layerremove", {
                layer: e,
              }))
          : (this._nonPointGroup.removeLayer(e),
            this.fire("layerremove", {
              layer: e,
            })),
        this);
  },
  addLayers: function (n, s) {
    if (!L.Util.isArray(n)) return this.addLayer(n);
    var o,
      a = this._featureGroup,
      h = this._nonPointGroup,
      l = this.options.chunkedLoading,
      u = this.options.chunkInterval,
      _ = this.options.chunkProgress,
      d = n.length,
      p = 0,
      c = !0;
    if (this._map) {
      var f = new Date().getTime(),
        m = L.bind(function () {
          var e = new Date().getTime();
          for (
            this._map && this._unspiderfy && this._unspiderfy();
            p < d;
            p++
          ) {
            if (l && p % 200 == 0) {
              var t = new Date().getTime() - e;
              if (u < t) break;
            }
            if ((o = n[p]) instanceof L.LayerGroup)
              c && ((n = n.slice()), (c = !1)),
                this._extractNonGroupLayers(o, n),
                (d = n.length);
            else if (o.getLatLng) {
              if (
                !this.hasLayer(o) &&
                (this._addLayer(o, this._maxZoom),
                s ||
                  this.fire("layeradd", {
                    layer: o,
                  }),
                o.__parent && 2 === o.__parent.getChildCount())
              ) {
                var i = o.__parent.getAllChildMarkers(),
                  r = i[0] === o ? i[1] : i[0];
                a.removeLayer(r);
              }
            } else
              h.addLayer(o),
                s ||
                  this.fire("layeradd", {
                    layer: o,
                  });
          }
          _ && _(p, d, new Date().getTime() - f),
            p === d
              ? (this._topClusterLevel._recalculateBounds(),
                this._refreshClustersIcons(),
                this._topClusterLevel._recursivelyAddChildrenToMap(
                  null,
                  this._zoom,
                  this._currentShownBounds,
                ))
              : setTimeout(m, this.options.chunkDelay);
        }, this);
      m();
    } else
      for (var e = this._needsClustering; p < d; p++)
        (o = n[p]) instanceof L.LayerGroup
          ? (c && ((n = n.slice()), (c = !1)),
            this._extractNonGroupLayers(o, n),
            (d = n.length))
          : o.getLatLng
            ? this.hasLayer(o) || e.push(o)
            : h.addLayer(o);
    return this;
  },
  removeLayers: function (e) {
    var t,
      i,
      r = e.length,
      n = this._featureGroup,
      s = this._nonPointGroup,
      o = !0;
    if (!this._map) {
      for (t = 0; t < r; t++)
        (i = e[t]) instanceof L.LayerGroup
          ? (o && ((e = e.slice()), (o = !1)),
            this._extractNonGroupLayers(i, e),
            (r = e.length))
          : (this._arraySplice(this._needsClustering, i),
            s.removeLayer(i),
            this.hasLayer(i) &&
              this._needsRemoving.push({
                layer: i,
                latlng: i._latlng,
              }),
            this.fire("layerremove", {
              layer: i,
            }));
      return this;
    }
    if (this._unspiderfy) {
      this._unspiderfy();
      var a = e.slice(),
        h = r;
      for (t = 0; t < h; t++)
        (i = a[t]) instanceof L.LayerGroup
          ? (this._extractNonGroupLayers(i, a), (h = a.length))
          : this._unspiderfyLayer(i);
    }
    for (t = 0; t < r; t++)
      (i = e[t]) instanceof L.LayerGroup
        ? (o && ((e = e.slice()), (o = !1)),
          this._extractNonGroupLayers(i, e),
          (r = e.length))
        : i.__parent
          ? (this._removeLayer(i, !0, !0),
            this.fire("layerremove", {
              layer: i,
            }),
            n.hasLayer(i) &&
              (n.removeLayer(i), i.clusterShow && i.clusterShow()))
          : (s.removeLayer(i),
            this.fire("layerremove", {
              layer: i,
            }));
    return (
      this._topClusterLevel._recalculateBounds(),
      this._refreshClustersIcons(),
      this._topClusterLevel._recursivelyAddChildrenToMap(
        null,
        this._zoom,
        this._currentShownBounds,
      ),
      this
    );
  },
  clearLayers: function () {
    return (
      this._map ||
        ((this._needsClustering = []),
        (this._needsRemoving = []),
        delete this._gridClusters,
        delete this._gridUnclustered),
      this._noanimationUnspiderfy && this._noanimationUnspiderfy(),
      this._featureGroup.clearLayers(),
      this._nonPointGroup.clearLayers(),
      this.eachLayer(function (e) {
        e.off(this._childMarkerEventHandlers, this), delete e.__parent;
      }, this),
      this._map && this._generateInitialClusters(),
      this
    );
  },
  getBounds: function () {
    var e = new L.LatLngBounds();
    this._topClusterLevel && e.extend(this._topClusterLevel._bounds);
    for (var t = this._needsClustering.length - 1; 0 <= t; t--)
      e.extend(this._needsClustering[t].getLatLng());
    return e.extend(this._nonPointGroup.getBounds()), e;
  },
  eachLayer: function (e, t) {
    var i,
      r,
      n,
      s = this._needsClustering.slice(),
      o = this._needsRemoving;
    for (
      this._topClusterLevel && this._topClusterLevel.getAllChildMarkers(s),
        r = s.length - 1;
      0 <= r;
      r--
    ) {
      for (i = !0, n = o.length - 1; 0 <= n; n--)
        if (o[n].layer === s[r]) {
          i = !1;
          break;
        }
      i && e.call(t, s[r]);
    }
    this._nonPointGroup.eachLayer(e, t);
  },
  getLayers: function () {
    var t = [];
    return (
      this.eachLayer(function (e) {
        t.push(e);
      }),
      t
    );
  },
  getLayer: function (t) {
    var i = null;
    return (
      (t = parseInt(t, 10)),
      this.eachLayer(function (e) {
        L.stamp(e) === t && (i = e);
      }),
      i
    );
  },
  hasLayer: function (e) {
    if (!e) return !1;
    var t,
      i = this._needsClustering;
    for (t = i.length - 1; 0 <= t; t--) if (i[t] === e) return !0;
    for (t = (i = this._needsRemoving).length - 1; 0 <= t; t--)
      if (i[t].layer === e) return !1;
    return (
      !(!e.__parent || e.__parent._group !== this) ||
      this._nonPointGroup.hasLayer(e)
    );
  },
};
