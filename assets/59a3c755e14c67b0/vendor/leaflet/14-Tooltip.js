/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Ii = lf_Ai.extend({
  options: {
    pane: "tooltipPane",
    offset: [0, 0],
    direction: "auto",
    permanent: !1,
    sticky: !1,
    opacity: 0.9,
  },
  onAdd: function (t) {
    lf_Ai.prototype.onAdd.call(this, t),
      this.setOpacity(this.options.opacity),
      t.fire("tooltipopen", {
        tooltip: this,
      }),
      this._source &&
        (this.addEventParent(this._source),
        this._source.fire(
          "tooltipopen",
          {
            tooltip: this,
          },
          !0,
        ));
  },
  onRemove: function (t) {
    lf_Ai.prototype.onRemove.call(this, t),
      t.fire("tooltipclose", {
        tooltip: this,
      }),
      this._source &&
        (this.removeEventParent(this._source),
        this._source.fire(
          "tooltipclose",
          {
            tooltip: this,
          },
          !0,
        ));
  },
  getEvents: function () {
    var t = lf_Ai.prototype.getEvents.call(this);
    return this.options.permanent || (t.preclick = this.close), t;
  },
  _initLayout: function () {
    var t =
      "leaflet-tooltip " +
      (this.options.className || "") +
      " leaflet-zoom-" +
      (this._zoomAnimated ? "animated" : "hide");
    (this._contentNode = this._container = lf_P("div", t)),
      this._container.setAttribute("role", "tooltip"),
      this._container.setAttribute("id", "leaflet-tooltip-" + lf_h(this));
  },
  _updateLayout: function () {},
  _adjustPan: function () {},
  _setPosition: function (t) {
    var e,
      i = this._map,
      n = this._container,
      o = i.latLngToContainerPoint(i.getCenter()),
      i = i.layerPointToContainerPoint(t),
      s = this.options.direction,
      r = n.offsetWidth,
      a = n.offsetHeight,
      h = lf_m(this.options.offset),
      l = this._getAnchor(),
      i =
        "top" === s
          ? ((e = r / 2), a)
          : "bottom" === s
            ? ((e = r / 2), 0)
            : ((e =
                "center" === s
                  ? r / 2
                  : "right" === s
                    ? 0
                    : "left" === s
                      ? r
                      : i.x < o.x
                        ? ((s = "right"), 0)
                        : ((s = "left"), r + 2 * (h.x + l.x))),
              a / 2);
    (t = t
      .subtract(lf_m(e, i, !0))
      .add(h)
      .add(l)),
      lf_z(n, "leaflet-tooltip-right"),
      lf_z(n, "leaflet-tooltip-left"),
      lf_z(n, "leaflet-tooltip-top"),
      lf_z(n, "leaflet-tooltip-bottom"),
      lf_M(n, "leaflet-tooltip-" + s),
      lf_Z(n, t);
  },
  _updatePosition: function () {
    var t = this._map.latLngToLayerPoint(this._latlng);
    this._setPosition(t);
  },
  setOpacity: function (t) {
    (this.options.opacity = t), this._container && lf_C(this._container, t);
  },
  _animateZoom: function (t) {
    t = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center);
    this._setPosition(t);
  },
  _getAnchor: function () {
    return lf_m(
      this._source && this._source._getTooltipAnchor && !this.options.sticky
        ? this._source._getTooltipAnchor()
        : [0, 0],
    );
  },
});
lf_A.include({
  openTooltip: function (t, e, i) {
    return this._initOverlay(lf_Ii, t, e, i).openOn(this), this;
  },
  closeTooltip: function (t) {
    return t.close(), this;
  },
});
lf_o.include({
  bindTooltip: function (t, e) {
    return (
      this._tooltip && this.isTooltipOpen() && this.unbindTooltip(),
      (this._tooltip = this._initOverlay(lf_Ii, this._tooltip, t, e)),
      this._initTooltipInteractions(),
      this._tooltip.options.permanent &&
        this._map &&
        this._map.hasLayer(this) &&
        this.openTooltip(),
      this
    );
  },
  unbindTooltip: function () {
    return (
      this._tooltip &&
        (this._initTooltipInteractions(!0),
        this.closeTooltip(),
        (this._tooltip = null)),
      this
    );
  },
  _initTooltipInteractions: function (t) {
    var e, i;
    (!t && this._tooltipHandlersAdded) ||
      ((e = t ? "off" : "on"),
      (i = {
        remove: this.closeTooltip,
        move: this._moveTooltip,
      }),
      this._tooltip.options.permanent
        ? (i.add = this._openTooltip)
        : ((i.mouseover = this._openTooltip),
          (i.mouseout = this.closeTooltip),
          (i.click = this._openTooltip),
          this._map
            ? this._addFocusListeners()
            : (i.add = this._addFocusListeners)),
      this._tooltip.options.sticky && (i.mousemove = this._moveTooltip),
      this[e](i),
      (this._tooltipHandlersAdded = !t));
  },
  openTooltip: function (t) {
    return (
      this._tooltip &&
        (this instanceof lf_ci || (this._tooltip._source = this),
        this._tooltip._prepareOpen(t) &&
          (this._tooltip.openOn(this._map),
          this.getElement
            ? this._setAriaDescribedByOnLayer(this)
            : this.eachLayer &&
              this.eachLayer(this._setAriaDescribedByOnLayer, this))),
      this
    );
  },
  closeTooltip: function () {
    if (this._tooltip) return this._tooltip.close();
  },
  toggleTooltip: function () {
    return this._tooltip && this._tooltip.toggle(this), this;
  },
  isTooltipOpen: function () {
    return this._tooltip.isOpen();
  },
  setTooltipContent: function (t) {
    return this._tooltip && this._tooltip.setContent(t), this;
  },
  getTooltip: function () {
    return this._tooltip;
  },
  _addFocusListeners: function () {
    this.getElement
      ? this._addFocusListenersOnLayer(this)
      : this.eachLayer && this.eachLayer(this._addFocusListenersOnLayer, this);
  },
  _addFocusListenersOnLayer: function (t) {
    var e = "function" == typeof t.getElement && t.getElement();
    e &&
      (lf_S(
        e,
        "focus",
        function () {
          (this._tooltip._source = t), this.openTooltip();
        },
        this,
      ),
      lf_S(e, "blur", this.closeTooltip, this));
  },
  _setAriaDescribedByOnLayer: function (t) {
    t = "function" == typeof t.getElement && t.getElement();
    t && t.setAttribute("aria-describedby", this._tooltip._container.id);
  },
  _openTooltip: function (t) {
    var e;
    this._tooltip &&
      this._map &&
      (this._map.dragging && this._map.dragging.moving() && !this._openOnceFlag
        ? ((this._openOnceFlag = !0),
          (e = this)._map.once("moveend", function () {
            (e._openOnceFlag = !1), e._openTooltip(t);
          }))
        : ((this._tooltip._source = t.layer || t.target),
          this.openTooltip(this._tooltip.options.sticky ? t.latlng : void 0)));
  },
  _moveTooltip: function (t) {
    var e = t.latlng;
    this._tooltip.options.sticky &&
      t.originalEvent &&
      ((t = this._map.mouseEventToContainerPoint(t.originalEvent)),
      (t = this._map.containerPointToLayerPoint(t)),
      (e = this._map.layerPointToLatLng(t))),
      this._tooltip.setLatLng(e);
  },
});
var lf_Ri = lf_di.extend({
  options: {
    iconSize: [12, 12],
    html: !1,
    bgPos: null,
    className: "leaflet-div-icon",
  },
  createIcon: function (t) {
    var t = t && "DIV" === t.tagName ? t : document.createElement("div"),
      e = this.options;
    return (
      e.html instanceof Element
        ? (lf_me(t), t.appendChild(e.html))
        : (t.innerHTML = !1 !== e.html ? e.html : ""),
      e.bgPos &&
        ((e = lf_m(e.bgPos)),
        (t.style.backgroundPosition = -e.x + "px " + -e.y + "px")),
      this._setIconStyles(t, "icon"),
      t
    );
  },
  createShadow: function () {
    return null;
  },
});
lf_di.Default = lf__i;
