/*! Leaflet 1.9.4; locally maintained modular distribution. See vendor/README.md and license notice. */
"use strict";
var lf_Zt = lf_n.extend({
  addHooks: function () {
    var t;
    this._draggable ||
      ((t = this._map),
      (this._draggable = new lf_Xe(t._mapPane, t._container)),
      this._draggable.on(
        {
          dragstart: this._onDragStart,
          drag: this._onDrag,
          dragend: this._onDragEnd,
        },
        this,
      ),
      this._draggable.on("predrag", this._onPreDragLimit, this),
      t.options.worldCopyJump &&
        (this._draggable.on("predrag", this._onPreDragWrap, this),
        t.on("zoomend", this._onZoomEnd, this),
        t.whenReady(this._onZoomEnd, this))),
      lf_M(this._map._container, "leaflet-grab leaflet-touch-drag"),
      this._draggable.enable(),
      (this._positions = []),
      (this._times = []);
  },
  removeHooks: function () {
    lf_z(this._map._container, "leaflet-grab"),
      lf_z(this._map._container, "leaflet-touch-drag"),
      this._draggable.disable();
  },
  moved: function () {
    return this._draggable && this._draggable._moved;
  },
  moving: function () {
    return this._draggable && this._draggable._moving;
  },
  _onDragStart: function () {
    var t,
      e = this._map;
    e._stop(),
      this._map.options.maxBounds && this._map.options.maxBoundsViscosity
        ? ((t = lf_g(this._map.options.maxBounds)),
          (this._offsetLimit = lf__(
            this._map.latLngToContainerPoint(t.getNorthWest()).multiplyBy(-1),
            this._map
              .latLngToContainerPoint(t.getSouthEast())
              .multiplyBy(-1)
              .add(this._map.getSize()),
          )),
          (this._viscosity = Math.min(
            1,
            Math.max(0, this._map.options.maxBoundsViscosity),
          )))
        : (this._offsetLimit = null),
      e.fire("movestart").fire("dragstart"),
      e.options.inertia && ((this._positions = []), (this._times = []));
  },
  _onDrag: function (t) {
    var e, i;
    this._map.options.inertia &&
      ((e = this._lastTime = +new Date()),
      (i = this._lastPos = this._draggable._absPos || this._draggable._newPos),
      this._positions.push(i),
      this._times.push(e),
      this._prunePositions(e)),
      this._map.fire("move", t).fire("drag", t);
  },
  _prunePositions: function (t) {
    for (; 1 < this._positions.length && 50 < t - this._times[0]; )
      this._positions.shift(), this._times.shift();
  },
  _onZoomEnd: function () {
    var t = this._map.getSize().divideBy(2),
      e = this._map.latLngToLayerPoint([0, 0]);
    (this._initialWorldOffset = e.subtract(t).x),
      (this._worldWidth = this._map.getPixelWorldBounds().getSize().x);
  },
  _viscousLimit: function (t, e) {
    return t - (t - e) * this._viscosity;
  },
  _onPreDragLimit: function () {
    var t, e;
    this._viscosity &&
      this._offsetLimit &&
      ((t = this._draggable._newPos.subtract(this._draggable._startPos)),
      (e = this._offsetLimit),
      t.x < e.min.x && (t.x = this._viscousLimit(t.x, e.min.x)),
      t.y < e.min.y && (t.y = this._viscousLimit(t.y, e.min.y)),
      t.x > e.max.x && (t.x = this._viscousLimit(t.x, e.max.x)),
      t.y > e.max.y && (t.y = this._viscousLimit(t.y, e.max.y)),
      (this._draggable._newPos = this._draggable._startPos.add(t)));
  },
  _onPreDragWrap: function () {
    var t = this._worldWidth,
      e = Math.round(t / 2),
      i = this._initialWorldOffset,
      n = this._draggable._newPos.x,
      o = ((n - e + i) % t) + e - i,
      n = ((n + e + i) % t) - e - i,
      t = Math.abs(o + i) < Math.abs(n + i) ? o : n;
    (this._draggable._absPos = this._draggable._newPos.clone()),
      (this._draggable._newPos.x = t);
  },
  _onDragEnd: function (t) {
    var e,
      i,
      n,
      o,
      s = this._map,
      r = s.options,
      a = !r.inertia || t.noInertia || this._times.length < 2;
    s.fire("dragend", t),
      !a &&
      (this._prunePositions(+new Date()),
      (t = this._lastPos.subtract(this._positions[0])),
      (a = (this._lastTime - this._times[0]) / 1e3),
      (e = r.easeLinearity),
      (a = (t = t.multiplyBy(e / a)).distanceTo([0, 0])),
      (i = Math.min(r.inertiaMaxSpeed, a)),
      (t = t.multiplyBy(i / a)),
      (n = i / (r.inertiaDeceleration * e)),
      (o = t.multiplyBy(-n / 2).round()).x || o.y)
        ? ((o = s._limitOffset(o, s.options.maxBounds)),
          lf_x(function () {
            s.panBy(o, {
              duration: n,
              easeLinearity: e,
              noMoveStart: !0,
              animate: !0,
            });
          }))
        : s.fire("moveend");
  },
});
lf_A.addInitHook("addHandler", "dragging", lf_Zt);
lf_A.mergeOptions({
  keyboard: !0,
  keyboardPanDelta: 80,
});
var lf_St = lf_n.extend({
  keyCodes: {
    left: [37],
    right: [39],
    down: [40],
    up: [38],
    zoomIn: [187, 107, 61, 171],
    zoomOut: [189, 109, 54, 173],
  },
  initialize: function (t) {
    (this._map = t),
      this._setPanDelta(t.options.keyboardPanDelta),
      this._setZoomDelta(t.options.zoomDelta);
  },
  addHooks: function () {
    var t = this._map._container;
    t.tabIndex <= 0 && (t.tabIndex = "0"),
      lf_S(
        t,
        {
          focus: this._onFocus,
          blur: this._onBlur,
          mousedown: this._onMouseDown,
        },
        this,
      ),
      this._map.on(
        {
          focus: this._addHooks,
          blur: this._removeHooks,
        },
        this,
      );
  },
  removeHooks: function () {
    this._removeHooks(),
      lf_k(
        this._map._container,
        {
          focus: this._onFocus,
          blur: this._onBlur,
          mousedown: this._onMouseDown,
        },
        this,
      ),
      this._map.off(
        {
          focus: this._addHooks,
          blur: this._removeHooks,
        },
        this,
      );
  },
  _onMouseDown: function () {
    var t, e, i;
    this._focused ||
      ((i = document.body),
      (t = document.documentElement),
      (e = i.scrollTop || t.scrollTop),
      (i = i.scrollLeft || t.scrollLeft),
      this._map._container.focus(),
      window.scrollTo(i, e));
  },
  _onFocus: function () {
    (this._focused = !0), this._map.fire("focus");
  },
  _onBlur: function () {
    (this._focused = !1), this._map.fire("blur");
  },
  _setPanDelta: function (t) {
    for (
      var e = (this._panKeys = {}), i = this.keyCodes, n = 0, o = i.left.length;
      n < o;
      n++
    )
      e[i.left[n]] = [-1 * t, 0];
    for (n = 0, o = i.right.length; n < o; n++) e[i.right[n]] = [t, 0];
    for (n = 0, o = i.down.length; n < o; n++) e[i.down[n]] = [0, t];
    for (n = 0, o = i.up.length; n < o; n++) e[i.up[n]] = [0, -1 * t];
  },
  _setZoomDelta: function (t) {
    for (
      var e = (this._zoomKeys = {}),
        i = this.keyCodes,
        n = 0,
        o = i.zoomIn.length;
      n < o;
      n++
    )
      e[i.zoomIn[n]] = t;
    for (n = 0, o = i.zoomOut.length; n < o; n++) e[i.zoomOut[n]] = -t;
  },
  _addHooks: function () {
    lf_S(document, "keydown", this._onKeyDown, this);
  },
  _removeHooks: function () {
    lf_k(document, "keydown", this._onKeyDown, this);
  },
  _onKeyDown: function (t) {
    if (!(t.altKey || t.ctrlKey || t.metaKey)) {
      var e,
        i,
        n = t.keyCode,
        o = this._map;
      if (n in this._panKeys)
        (o._panAnim && o._panAnim._inProgress) ||
          ((i = this._panKeys[n]),
          t.shiftKey && (i = lf_m(i).multiplyBy(3)),
          o.options.maxBounds &&
            (i = o._limitOffset(lf_m(i), o.options.maxBounds)),
          o.options.worldCopyJump
            ? ((e = o.wrapLatLng(o.unproject(o.project(o.getCenter()).add(i)))),
              o.panTo(e))
            : o.panBy(i));
      else if (n in this._zoomKeys)
        o.setZoom(o.getZoom() + (t.shiftKey ? 3 : 1) * this._zoomKeys[n]);
      else {
        if (27 !== n || !o._popup || !o._popup.options.closeOnEscapeKey) return;
        o.closePopup();
      }
      lf_Re(t);
    }
  },
});
lf_A.addInitHook("addHandler", "keyboard", lf_St);
lf_A.mergeOptions({
  scrollWheelZoom: !0,
  wheelDebounceTime: 40,
  wheelPxPerZoomLevel: 60,
});
var lf_Et = lf_n.extend({
  addHooks: function () {
    lf_S(this._map._container, "wheel", this._onWheelScroll, this),
      (this._delta = 0);
  },
  removeHooks: function () {
    lf_k(this._map._container, "wheel", this._onWheelScroll, this);
  },
  _onWheelScroll: function (t) {
    var e = lf_He(t),
      i = this._map.options.wheelDebounceTime,
      e =
        ((this._delta += e),
        (this._lastMousePos = this._map.mouseEventToContainerPoint(t)),
        this._startTime || (this._startTime = +new Date()),
        Math.max(i - (+new Date() - this._startTime), 0));
    clearTimeout(this._timer),
      (this._timer = setTimeout(lf_a(this._performZoom, this), e)),
      lf_Re(t);
  },
  _performZoom: function () {
    var t = this._map,
      e = t.getZoom(),
      i = this._map.options.zoomSnap || 0,
      n =
        (t._stop(), this._delta / (4 * this._map.options.wheelPxPerZoomLevel)),
      n = (4 * Math.log(2 / (1 + Math.exp(-Math.abs(n))))) / Math.LN2,
      i = i ? Math.ceil(n / i) * i : n,
      n = t._limitZoom(e + (0 < this._delta ? i : -i)) - e;
    (this._delta = 0),
      (this._startTime = null),
      n &&
        ("center" === t.options.scrollWheelZoom
          ? t.setZoom(e + n)
          : t.setZoomAround(this._lastMousePos, e + n));
  },
});
lf_A.addInitHook("addHandler", "scrollWheelZoom", lf_Et);
lf_A.mergeOptions({
  tapHold: lf_b.touchNative && lf_b.safari && lf_b.mobile,
  tapTolerance: 15,
});
var lf_kt = lf_n.extend({
  addHooks: function () {
    lf_S(this._map._container, "touchstart", this._onDown, this);
  },
  removeHooks: function () {
    lf_k(this._map._container, "touchstart", this._onDown, this);
  },
  _onDown: function (t) {
    var e;
    clearTimeout(this._holdTimeout),
      1 === t.touches.length &&
        ((e = t.touches[0]),
        (this._startPos = this._newPos = new lf_p(e.clientX, e.clientY)),
        (this._holdTimeout = setTimeout(
          lf_a(function () {
            this._cancel(),
              this._isTapValid() &&
                (lf_S(document, "touchend", lf_O),
                lf_S(
                  document,
                  "touchend touchcancel",
                  this._cancelClickPrevent,
                ),
                this._simulateEvent("contextmenu", e));
          }, this),
          600,
        )),
        lf_S(document, "touchend touchcancel contextmenu", this._cancel, this),
        lf_S(document, "touchmove", this._onMove, this));
  },
  _cancelClickPrevent: function t() {
    lf_k(document, "touchend", lf_O), lf_k(document, "touchend touchcancel", t);
  },
  _cancel: function () {
    clearTimeout(this._holdTimeout),
      lf_k(document, "touchend touchcancel contextmenu", this._cancel, this),
      lf_k(document, "touchmove", this._onMove, this);
  },
  _onMove: function (t) {
    t = t.touches[0];
    this._newPos = new lf_p(t.clientX, t.clientY);
  },
  _isTapValid: function () {
    return (
      this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance
    );
  },
  _simulateEvent: function (t, e) {
    t = new MouseEvent(t, {
      bubbles: !0,
      cancelable: !0,
      view: window,
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    (t._simulated = !0), e.target.dispatchEvent(t);
  },
});
lf_A.addInitHook("addHandler", "tapHold", lf_kt);
lf_A.mergeOptions({
  touchZoom: lf_b.touch,
  bounceAtZoomLimits: !0,
});
