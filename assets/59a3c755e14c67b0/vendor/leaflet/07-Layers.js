/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
lf_A.include({
  addControl: function (t) {
    return t.addTo(this), this;
  },
  removeControl: function (t) {
    return t.remove(), this;
  },
  _initControlPos: function () {
    var i = (this._controlCorners = {}),
      n = "leaflet-",
      o = (this._controlContainer = lf_P(
        "div",
        n + "control-container",
        this._container,
      ));
    function t(t, e) {
      i[t + e] = lf_P("div", n + t + " " + n + e, o);
    }
    t("top", "left"),
      t("top", "right"),
      t("bottom", "left"),
      t("bottom", "right");
  },
  _clearControlPos: function () {
    for (var t in this._controlCorners) lf_T(this._controlCorners[t]);
    lf_T(this._controlContainer),
      delete this._controlCorners,
      delete this._controlContainer;
  },
});
var lf_Ve = lf_B.extend({
  options: {
    collapsed: !0,
    position: "topright",
    autoZIndex: !0,
    hideSingleBase: !1,
    sortLayers: !1,
    sortFunction: function (t, e, i, n) {
      return i < n ? -1 : n < i ? 1 : 0;
    },
  },
  initialize: function (t, e, i) {
    for (var n in (lf_c(this, i),
    (this._layerControlInputs = []),
    (this._layers = []),
    (this._lastZIndex = 0),
    (this._handlingClick = !1),
    (this._preventClick = !1),
    t))
      this._addLayer(t[n], n);
    for (n in e) this._addLayer(e[n], n, !0);
  },
  onAdd: function (t) {
    this._initLayout(),
      this._update(),
      (this._map = t).on("zoomend", this._checkDisabledLayers, this);
    for (var e = 0; e < this._layers.length; e++)
      this._layers[e].layer.on("add remove", this._onLayerChange, this);
    return this._container;
  },
  addTo: function (t) {
    return lf_B.prototype.addTo.call(this, t), this._expandIfNotCollapsed();
  },
  onRemove: function () {
    this._map.off("zoomend", this._checkDisabledLayers, this);
    for (var t = 0; t < this._layers.length; t++)
      this._layers[t].layer.off("add remove", this._onLayerChange, this);
  },
  addBaseLayer: function (t, e) {
    return this._addLayer(t, e), this._map ? this._update() : this;
  },
  addOverlay: function (t, e) {
    return this._addLayer(t, e, !0), this._map ? this._update() : this;
  },
  removeLayer: function (t) {
    t.off("add remove", this._onLayerChange, this);
    t = this._getLayer(lf_h(t));
    return (
      t && this._layers.splice(this._layers.indexOf(t), 1),
      this._map ? this._update() : this
    );
  },
  expand: function () {
    lf_M(this._container, "leaflet-control-layers-expanded"),
      (this._section.style.height = null);
    var t = this._map.getSize().y - (this._container.offsetTop + 50);
    return (
      t < this._section.clientHeight
        ? (lf_M(this._section, "leaflet-control-layers-scrollbar"),
          (this._section.style.height = t + "px"))
        : lf_z(this._section, "leaflet-control-layers-scrollbar"),
      this._checkDisabledLayers(),
      this
    );
  },
  collapse: function () {
    return lf_z(this._container, "leaflet-control-layers-expanded"), this;
  },
  _initLayout: function () {
    var t = "leaflet-control-layers",
      e = (this._container = lf_P("div", t)),
      i = this.options.collapsed,
      n =
        (e.setAttribute("aria-haspopup", !0),
        lf_Ie(e),
        lf_Be(e),
        (this._section = lf_P("section", t + "-list"))),
      o =
        (i &&
          (this._map.on("click", this.collapse, this),
          lf_S(
            e,
            {
              mouseenter: this._expandSafely,
              mouseleave: this.collapse,
            },
            this,
          )),
        (this._layersLink = lf_P("a", t + "-toggle", e)));
    (o.href = "#"),
      (o.title = "Layers"),
      o.setAttribute("role", "button"),
      lf_S(
        o,
        {
          keydown: function (t) {
            13 === t.keyCode && this._expandSafely();
          },
          click: function (t) {
            lf_O(t), this._expandSafely();
          },
        },
        this,
      ),
      i || this.expand(),
      (this._baseLayersList = lf_P("div", t + "-base", n)),
      (this._separator = lf_P("div", t + "-separator", n)),
      (this._overlaysList = lf_P("div", t + "-overlays", n)),
      e.appendChild(n);
  },
  _getLayer: function (t) {
    for (var e = 0; e < this._layers.length; e++)
      if (this._layers[e] && lf_h(this._layers[e].layer) === t)
        return this._layers[e];
  },
  _addLayer: function (t, e, i) {
    this._map && t.on("add remove", this._onLayerChange, this),
      this._layers.push({
        layer: t,
        name: e,
        overlay: i,
      }),
      this.options.sortLayers &&
        this._layers.sort(
          lf_a(function (t, e) {
            return this.options.sortFunction(t.layer, e.layer, t.name, e.name);
          }, this),
        ),
      this.options.autoZIndex &&
        t.setZIndex &&
        (this._lastZIndex++, t.setZIndex(this._lastZIndex)),
      this._expandIfNotCollapsed();
  },
  _update: function () {
    if (this._container) {
      lf_me(this._baseLayersList),
        lf_me(this._overlaysList),
        (this._layerControlInputs = []);
      for (var t, e, i, n = 0, o = 0; o < this._layers.length; o++)
        (i = this._layers[o]),
          this._addItem(i),
          (e = e || i.overlay),
          (t = t || !i.overlay),
          (n += i.overlay ? 0 : 1);
      this.options.hideSingleBase &&
        (this._baseLayersList.style.display = (t = t && 1 < n) ? "" : "none"),
        (this._separator.style.display = e && t ? "" : "none");
    }
    return this;
  },
  _onLayerChange: function (t) {
    this._handlingClick || this._update();
    var e = this._getLayer(lf_h(t.target)),
      t = e.overlay
        ? "add" === t.type
          ? "overlayadd"
          : "overlayremove"
        : "add" === t.type
          ? "baselayerchange"
          : null;
    t && this._map.fire(t, e);
  },
  _createRadioElement: function (t, e) {
    (t =
      '<input type="radio" class="leaflet-control-layers-selector" name="' +
      t +
      '"' +
      (e ? ' checked="checked"' : "") +
      "/>"),
      (e = document.createElement("div"));
    return (e.innerHTML = t), e.firstChild;
  },
  _addItem: function (t) {
    var e,
      i = document.createElement("label"),
      n = this._map.hasLayer(t.layer),
      n =
        (t.overlay
          ? (((e = document.createElement("input")).type = "checkbox"),
            (e.className = "leaflet-control-layers-selector"),
            (e.defaultChecked = n))
          : (e = this._createRadioElement(
              "leaflet-base-layers_" + lf_h(this),
              n,
            )),
        this._layerControlInputs.push(e),
        (e.layerId = lf_h(t.layer)),
        lf_S(e, "click", this._onInputClick, this),
        document.createElement("span")),
      o = ((n.innerHTML = " " + t.name), document.createElement("span"));
    return (
      i.appendChild(o),
      o.appendChild(e),
      o.appendChild(n),
      (t.overlay ? this._overlaysList : this._baseLayersList).appendChild(i),
      this._checkDisabledLayers(),
      i
    );
  },
  _onInputClick: function () {
    if (!this._preventClick) {
      var t,
        e,
        i = this._layerControlInputs,
        n = [],
        o = [];
      this._handlingClick = !0;
      for (var s = i.length - 1; 0 <= s; s--)
        (t = i[s]),
          (e = this._getLayer(t.layerId).layer),
          t.checked ? n.push(e) : t.checked || o.push(e);
      for (s = 0; s < o.length; s++)
        this._map.hasLayer(o[s]) && this._map.removeLayer(o[s]);
      for (s = 0; s < n.length; s++)
        this._map.hasLayer(n[s]) || this._map.addLayer(n[s]);
      (this._handlingClick = !1), this._refocusOnMap();
    }
  },
  _checkDisabledLayers: function () {
    for (
      var t,
        e,
        i = this._layerControlInputs,
        n = this._map.getZoom(),
        o = i.length - 1;
      0 <= o;
      o--
    )
      (t = i[o]),
        (e = this._getLayer(t.layerId).layer),
        (t.disabled =
          (void 0 !== e.options.minZoom && n < e.options.minZoom) ||
          (void 0 !== e.options.maxZoom && n > e.options.maxZoom));
  },
  _expandIfNotCollapsed: function () {
    return this._map && !this.options.collapsed && this.expand(), this;
  },
  _expandSafely: function () {
    var t = this._section,
      e =
        ((this._preventClick = !0),
        lf_S(t, "click", lf_O),
        this.expand(),
        this);
    setTimeout(function () {
      lf_k(t, "click", lf_O), (e._preventClick = !1);
    });
  },
});
var lf_qe = lf_B.extend({
  options: {
    position: "topleft",
    zoomInText: '<span aria-hidden="true">+</span>',
    zoomInTitle: "Zoom in",
    zoomOutText: '<span aria-hidden="true">&#x2212;</span>',
    zoomOutTitle: "Zoom out",
  },
  onAdd: function (t) {
    var e = "leaflet-control-zoom",
      i = lf_P("div", e + " leaflet-bar"),
      n = this.options;
    return (
      (this._zoomInButton = this._createButton(
        n.zoomInText,
        n.zoomInTitle,
        e + "-in",
        i,
        this._zoomIn,
      )),
      (this._zoomOutButton = this._createButton(
        n.zoomOutText,
        n.zoomOutTitle,
        e + "-out",
        i,
        this._zoomOut,
      )),
      this._updateDisabled(),
      t.on("zoomend zoomlevelschange", this._updateDisabled, this),
      i
    );
  },
  onRemove: function (t) {
    t.off("zoomend zoomlevelschange", this._updateDisabled, this);
  },
  disable: function () {
    return (this._disabled = !0), this._updateDisabled(), this;
  },
  enable: function () {
    return (this._disabled = !1), this._updateDisabled(), this;
  },
  _zoomIn: function (t) {
    !this._disabled &&
      this._map._zoom < this._map.getMaxZoom() &&
      this._map.zoomIn(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
  },
  _zoomOut: function (t) {
    !this._disabled &&
      this._map._zoom > this._map.getMinZoom() &&
      this._map.zoomOut(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
  },
  _createButton: function (t, e, i, n, o) {
    i = lf_P("a", i, n);
    return (
      (i.innerHTML = t),
      (i.href = "#"),
      (i.title = e),
      i.setAttribute("role", "button"),
      i.setAttribute("aria-label", e),
      lf_Ie(i),
      lf_S(i, "click", lf_Re),
      lf_S(i, "click", o, this),
      lf_S(i, "click", this._refocusOnMap, this),
      i
    );
  },
  _updateDisabled: function () {
    var t = this._map,
      e = "leaflet-disabled";
    lf_z(this._zoomInButton, e),
      lf_z(this._zoomOutButton, e),
      this._zoomInButton.setAttribute("aria-disabled", "false"),
      this._zoomOutButton.setAttribute("aria-disabled", "false"),
      (!this._disabled && t._zoom !== t.getMinZoom()) ||
        (lf_M(this._zoomOutButton, e),
        this._zoomOutButton.setAttribute("aria-disabled", "true")),
      (!this._disabled && t._zoom !== t.getMaxZoom()) ||
        (lf_M(this._zoomInButton, e),
        this._zoomInButton.setAttribute("aria-disabled", "true"));
  },
});
lf_A.mergeOptions({
  zoomControl: !0,
});
lf_A.addInitHook(function () {
  this.options.zoomControl &&
    ((this.zoomControl = new lf_qe()), this.addControl(this.zoomControl));
});
