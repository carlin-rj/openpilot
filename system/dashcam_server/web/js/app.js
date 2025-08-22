const t = 500;
const e = 10;
const i = 100;
const a = 0.5;
const s = 60;
const n = 1 / 30;
const r = [{
  r: 13,
  g: 248,
  b: 122,
  a: 102
}, {
  r: 114,
  g: 255,
  b: 92,
  a: 89
}, {
  r: 114,
  g: 255,
  b: 92,
  a: 0
}];
const o = [{
  r: 242,
  g: 242,
  b: 242,
  a: 102
}, {
  r: 242,
  g: 242,
  b: 242,
  a: 89
}, {
  r: 242,
  g: 242,
  b: 242,
  a: 0
}];
function l(t, e) {
  const i = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let a = 0; a < 3; a++) {
    for (let s = 0; s < 3; s++) {
      i[a][s] = t[a][0] * e[0][s] + t[a][1] * e[1][s] + t[a][2] * e[2][s];
    }
  }
  return i;
}
function d(t, e) {
  return [t[0][0] * e[0] + t[0][1] * e[1] + t[0][2] * e[2], t[1][0] * e[0] + t[1][1] * e[1] + t[1][2] * e[2], t[2][0] * e[0] + t[2][1] * e[1] + t[2][2] * e[2]];
}
function h(t, e, i, a) {
  const s = t[0][0] * e + t[0][1] * i + t[0][2] * a;
  const n = t[1][0] * e + t[1][1] * i + t[1][2] * a;
  const r = t[2][0] * e + t[2][1] * i + t[2][2] * a;
  if (Math.abs(r) < 0.000001) {
    return {
      x: 0,
      y: 0,
      z: 0,
      valid: false
    };
  } else {
    return {
      x: s / r,
      y: n / r,
      z: r,
      valid: true
    };
  }
}
function c(t, e, i) {
  return Math.max(e, Math.min(i, t));
}
function _(t) {
  const [e, i, a] = t;
  const s = Math.cos(e);
  const n = Math.sin(e);
  const r = Math.cos(i);
  const o = Math.sin(i);
  const l = Math.cos(a);
  const d = Math.sin(a);
  return [[l * r, l * o * n - d * s, l * o * s + d * n], [d * r, d * o * n + l * s, d * o * s - l * n], [-o, r * n, r * s]];
}
const g = [[0, -1, 0], [0, 0, -1], [1, 0, 0]];
const u = {
  tici: {
    fcam: {
      intrinsics: [[2648, 0, 964], [0, 2648, 604], [0, 0, 1]],
      width: 1928,
      height: 1208
    }
  },
  mici: {
    fcam: {
      intrinsics: [[1141.5, 0, 672], [0, 1141.5, 380], [0, 0, 1]],
      width: 1344,
      height: 760
    }
  }
};
class p {
  constructor() {
    window.debug;
    this._longitudinal_control = false;
    this._experimental_mode = false;
    this._blend_factor = 1;
    this._prev_allow_throttle = true;
    this._lane_line_probs = new Float32Array(4);
    this._road_edge_stds = new Float32Array(2);
    this._lead_vehicles = [{}, {}];
    this._path_offset_z = 1.22;
    this._use_simple_lines = true;
    this._path = {
      raw_points: [],
      projected_points: []
    };
    this._lane_lines = [{
      raw_points: [],
      projected_points: []
    }, {
      raw_points: [],
      projected_points: []
    }, {
      raw_points: [],
      projected_points: []
    }, {
      raw_points: [],
      projected_points: []
    }];
    this._road_edges = [{
      raw_points: [],
      projected_points: []
    }, {
      raw_points: [],
      projected_points: []
    }];
    this._acceleration_x = new Float32Array(0);
    this._maxPoints = 200;
    this._leftPointsBuffer = new Array(this._maxPoints);
    this._rightPointsBuffer = new Array(this._maxPoints);
    this._transformCache = new Map();
    this._transformCacheValid = false;
    this._batchTransformEnabled = true;
    this._batchLeftX = new Float32Array(this._maxPoints);
    this._batchLeftY = new Float32Array(this._maxPoints);
    this._batchLeftZ = new Float32Array(this._maxPoints);
    this._batchRightX = new Float32Array(this._maxPoints);
    this._batchRightY = new Float32Array(this._maxPoints);
    this._batchRightZ = new Float32Array(this._maxPoints);
    this._gradientCache = new Map();
    this._gradientCacheMaxSize = 20;
    this._pathCache = new Map();
    this._pathCacheMaxSize = 10;
    this._lastPathPoints = null;
    this._lastPathHash = null;
    this._pathLengthCache = new Map();
    this._lastPathLengthCacheClear = 0;
    this._framePathLengthCache = new Map();
    this._lastFrameTime = 0;
    this._car_space_transform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    this._transform_dirty = true;
    this._clip_region = null;
    this._rect = null;
    // TOLOOK
    setInterval(() => {
      this._transformCache.clear();
      this._pathLengthCache.clear();
      this._gradientCache.clear();
      window.debug;
    }, 30000);
    this._exp_gradient = {
      start: [0, 1],
      end: [0, 0],
      colors: [],
      stops: []
    };
  }
  set_transform(t) {
    window.debug;
    this._car_space_transform = t;
    this._transform_dirty = true;
    this._transformCache.clear();
    this._transformCacheValid = false;
    this._gradientCache.clear();
    if (!this._transform_logged) {
      this._transform_logged = true;
    }
  }
  set_simple_lines_mode(t) {
    window.debug;
    this._use_simple_lines = t;
  }
  clear_caches() {
    window.debug;
    this._transformCache.clear();
    this._transformCacheValid = false;
    this._gradientCache.clear();
    this._pathCache.clear();
    this._lastPathHash = null;
  }
  render(t, e, i) {
    window.debug;
    this._rect = t;
    this.ctx = i;
    i.lineCap = "round";
    i.lineJoin = "round";
    if (!this._debug_logged) {
      this._debug_logged = true;
    }
    if (!e.liveCalibration || !e.modelV2) {
      return;
    }
    this._clip_region = {
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height
    };
    if (e.selfdriveState) {
      this._experimental_mode = e.selfdriveState.experimentalMode || false;
    }
    const a = e.liveCalibration;
    if (a && a.height && a.height.length > 0) {
      this._path_offset_z = a.height[0];
    }
    if (e.updated && e.updated.carParams) {
      this._longitudinal_control = e.carParams.openpilotLongitudinalControl || false;
    } else if (!(e.seen && e.seen.carParams)) {
      this._longitudinal_control = true;
    }
    const s = e.modelV2;
    if (!s) {
      return;
    }
    const n = e.valid && e.valid.radarState ? e.radarState : null;
    const r = n ? n.leadOne : null;
    const o = this._longitudinal_control && n !== null;
    if (!this._radar_logged && n) {
      this._radar_logged = true;
    }
    const l = e.updated && e.updated.modelV2;
    const d = e.updated && e.updated.radarState;
    if (!(this._update_logged || !l && !d)) {
      this._update_logged = true;
    }
    if (l || d || this._transform_dirty) {
      if (l) {
        this._update_raw_points(s);
      }
      const t = this._path.raw_points.map(t => t[0]);
      if (t.length === 0) {
        return;
      }
      this._update_model(r, t);
      if (o) {
        this._update_leads(n, t);
      }
      this._transform_dirty = false;
    }
    this._draw_lane_lines();
    this._draw_path(e);
    if (o && n) {
      this._draw_lead_indicator();
    }
  }
  _update_raw_points(t) {
    window.debug;
    if (t.position) {
      this._path.raw_points.length = 0;
      for (let e = 0; e < t.position.x.length; e++) {
        this._path.raw_points.push([t.position.x[e], t.position.y[e], t.position.z[e]]);
      }
    }
    if (this._transformCache.size > 200) {
      Array.from(this._transformCache.keys()).slice(0, 100).forEach(t => this._transformCache.delete(t));
      window.debug;
    }
    if (this._pathCache.size > this._pathCacheMaxSize) {
      const t = Array.from(this._pathCache.entries()).slice(-5);
      this._pathCache.clear();
      t.forEach(([t, e]) => this._pathCache.set(t, e));
    }
    if (t.laneLines) {
      t.laneLines.forEach((t, e) => {
        this._lane_lines[e].raw_points.length = 0;
        for (let i = 0; i < t.x.length; i++) {
          this._lane_lines[e].raw_points.push([t.x[i], t.y[i], t.z[i]]);
        }
      });
    }
    if (t.roadEdges) {
      t.roadEdges.forEach((t, e) => {
        this._road_edges[e].raw_points.length = 0;
        for (let i = 0; i < t.x.length; i++) {
          this._road_edges[e].raw_points.push([t.x[i], t.y[i], t.z[i]]);
        }
      });
    }
    this._lane_line_probs = new Float32Array(t.laneLineProbs || [0, 0, 0, 0]);
    this._road_edge_stds = new Float32Array(t.roadEdgeStds || [1, 1]);
    this._acceleration_x = new Float32Array(t.acceleration ? t.acceleration.x : []);
  }
  _update_model(t, a) {
    window.debug;
    let s = c(a[a.length - 1], e, i);
    const n = this._get_path_length_idx(this._lane_lines[0].raw_points.map(t => t[0]), s);
    this._batch_update_lines(n, t, a);
    this._update_experimental_gradient(this._rect.height);
  }
  _batch_update_lines(t, a, s) {
    const n = [];
    for (let e = 0; e < this._lane_lines.length; e++) {
      n.push({
        line: this._lane_lines[e],
        raw_points: this._lane_lines[e].raw_points,
        y_offset: this._lane_line_probs[e] * 0.025,
        z_offset: 0,
        max_idx: t,
        allow_invert: true
      });
    }
    for (let e = 0; e < this._road_edges.length; e++) {
      n.push({
        line: this._road_edges[e],
        raw_points: this._road_edges[e].raw_points,
        y_offset: 0.025,
        z_offset: 0,
        max_idx: t,
        allow_invert: true
      });
    }
    let r = c(s[s.length - 1], e, i);
    if (a && a.status) {
      const t = a.dRel * 2;
      r = c(t - Math.min(t * 0.35, 10), 0, r);
    }
    const o = this._get_path_length_idx(s, r);
    n.push({
      line: this._path,
      raw_points: this._path.raw_points,
      y_offset: 0.9,
      z_offset: this._path_offset_z,
      max_idx: o,
      allow_invert: false
    });
    this._batch_transform_all_lines(n);
  }
  _batch_transform_all_lines(t) {
    let e = 0;
    const i = [];
    for (const a of t) {
      const t = a.raw_points.slice(0, a.max_idx + 1).filter(t => t[0] >= 0);
      if (t.length > 0) {
        i.push({
          ...a,
          points: t,
          startIdx: e,
          numPoints: t.length
        });
        e += t.length * 2;
      }
    }
    if (e === 0) {
      return;
    }
    const a = new Float32Array(e);
    const s = new Float32Array(e);
    const n = new Float32Array(e);
    let r = 0;
    for (const t of i) {
      for (let e = 0; e < t.numPoints; e++) {
        const i = t.points[e];
        a[r] = i[0];
        s[r] = i[1] - t.y_offset;
        n[r] = i[2] + t.z_offset;
        r++;
        a[r] = i[0];
        s[r] = i[1] + t.y_offset;
        n[r] = i[2] + t.z_offset;
        r++;
      }
    }
    const o = this._batch_transform(a, s, n, e);
    for (const t of i) {
      const e = [];
      const i = [];
      const a = [];
      for (let e = 0; e < t.numPoints; e++) {
        const s = t.startIdx + e * 2;
        const n = s + 1;
        const r = o.points[s];
        const l = o.points[n];
        if (r.valid && l.valid) {
          const t = 10000;
          if (Math.abs(r.x) < t && Math.abs(r.y) < t && Math.abs(l.x) < t && Math.abs(l.y) < t) {
            i.push([r.x, r.y]);
            a.push([l.x, l.y]);
          }
        }
      }
      if (!t.allow_invert && i.length > 1) {
        const t = [];
        const e = [];
        let s = Infinity;
        for (let n = 0; n < i.length; n++) {
          if (i[n][1] <= s) {
            s = i[n][1];
            t.push(i[n]);
            e.push(a[n]);
          }
        }
        i.length = 0;
        a.length = 0;
        i.push(...t);
        a.push(...e);
      }
      i.forEach(t => e.push(t));
      for (let t = a.length - 1; t >= 0; t--) {
        e.push(a[t]);
      }
      t.line.projected_points = e;
    }
  }
  _update_leads(t, e) {
    window.debug;
    this._lead_vehicles = [{}, {}];
    const i = [t.leadOne, t.leadTwo];
    const a = [];
    const s = {
      x: [],
      y: [],
      z: []
    };
    for (let t = 0; t < i.length; t++) {
      const n = i[t];
      if (n && n.status) {
        const i = n.dRel;
        const r = n.yRel;
        const o = n.vRel;
        const l = this._get_path_length_idx(e, i);
        let d = 0;
        if (l < this._path.raw_points.length) {
          d = this._path.raw_points[l][2];
        }
        a.push({
          i: t,
          d_rel: i,
          v_rel: o
        });
        s.x.push(i);
        s.y.push(-r);
        s.z.push(d + this._path_offset_z);
      }
    }
    if (a.length === 0) {
      return;
    }
    const n = this._batch_transform(new Float32Array(s.x), new Float32Array(s.y), new Float32Array(s.z), a.length);
    for (let t = 0; t < a.length; t++) {
      const e = a[t];
      const i = n.points[t];
      if (i.valid) {
        const t = [i.x, i.y];
        this._lead_vehicles[e.i] = this._update_lead_vehicle(e.d_rel, e.v_rel, t, this._rect);
      }
    }
  }
  _map_to_screen(t, e, i) {
    window.debug;
    const a = h(this._car_space_transform, t, e, i);
    if (a.valid) {
      return [a.x, a.y];
    } else {
      return null;
    }
  }
  _batch_transform(t, e, i, a) {
    window.debug;
    const s = new Array(a);
    const n = this._car_space_transform;
    let r = 0;
    const o = n[0][0];
    const l = n[0][1];
    const d = n[0][2];
    const h = n[1][0];
    const c = n[1][1];
    const _ = n[1][2];
    const g = n[2][0];
    const u = n[2][1];
    const p = n[2][2];
    for (let n = 0; n < a; n++) {
      const a = t[n];
      const f = e[n];
      const w = i[n];
      const m = o * a + l * f + d * w;
      const b = h * a + c * f + _ * w;
      const v = g * a + u * f + p * w;
      if (Math.abs(v) >= 0.000001) {
        const t = 1 / v;
        s[n] = {
          x: m * t,
          y: b * t,
          valid: true
        };
        r++;
      } else {
        s[n] = {
          x: 0,
          y: 0,
          valid: false
        };
      }
    }
    return {
      points: s,
      validCount: r
    };
  }
  _map_line_to_polygon(t, e, i, a, s = true) {
    window.debug;
    if (t.length === 0) {
      return [];
    }
    let n = t.slice(0, a + 1);
    n = n.filter(t => t[0] >= 0);
    if (n.length === 0) {
      return [];
    }
    const r = n.length;
    const o = [];
    const l = [];
    if (this._batchTransformEnabled && r > 10) {
      for (let t = 0; t < r; t++) {
        const a = n[t];
        this._batchLeftX[t] = a[0];
        this._batchLeftY[t] = a[1] - e;
        this._batchLeftZ[t] = a[2] + i;
        this._batchRightX[t] = a[0];
        this._batchRightY[t] = a[1] + e;
        this._batchRightZ[t] = a[2] + i;
      }
      const t = this._batch_transform(this._batchLeftX, this._batchLeftY, this._batchLeftZ, r);
      const a = this._batch_transform(this._batchRightX, this._batchRightY, this._batchRightZ, r);
      for (let e = 0; e < r; e++) {
        const i = t.points[e];
        const s = a.points[e];
        if (i.valid && s.valid) {
          const t = 10000;
          if (Math.abs(i.x) < t && Math.abs(i.y) < t && Math.abs(s.x) < t && Math.abs(s.y) < t) {
            o.push([i.x, i.y]);
            l.push([s.x, s.y]);
          }
        }
      }
    } else {
      for (let t = 0; t < r; t++) {
        const a = n[t];
        const s = [a[0], a[1] - e, a[2] + i];
        const r = [a[0], a[1] + e, a[2] + i];
        const d = h(this._car_space_transform, s[0], s[1], s[2]);
        const c = h(this._car_space_transform, r[0], r[1], r[2]);
        if (d.valid && c.valid) {
          const t = [d.x, d.y];
          const e = [c.x, c.y];
          const i = 10000;
          if (Math.abs(t[0]) < i && Math.abs(t[1]) < i && Math.abs(e[0]) < i && Math.abs(e[1]) < i) {
            o.push(t);
            l.push(e);
          }
        }
      }
    }
    if (o.length === 0) {
      return [];
    }
    if (!s && o.length > 1) {
      const t = [];
      const e = [];
      let i = Infinity;
      for (let a = 0; a < o.length; a++) {
        if (o[a][1] <= i) {
          i = o[a][1];
          t.push(o[a]);
          e.push(l[a]);
        }
      }
      o.length = 0;
      l.length = 0;
      o.push(...t);
      l.push(...e);
    }
    const d = [];
    o.forEach(t => d.push(t));
    for (let t = l.length - 1; t >= 0; t--) {
      d.push(l[t]);
    }
    return d;
  }
  _get_path_length_idx(t, e) {
    window.debug;
    if (t.length === 0) {
      return 0;
    }
    const i = `${t.length}_${e.toFixed(2)}`;
    const a = Date.now();
    if (a !== this._lastFrameTime) {
      this._framePathLengthCache.clear();
      this._lastFrameTime = a;
    }
    if (this._framePathLengthCache.has(i)) {
      return this._framePathLengthCache.get(i);
    }
    if (this._pathLengthCache.has(i)) {
      const t = this._pathLengthCache.get(i);
      this._framePathLengthCache.set(i, t);
      return t;
    }
    if (a - this._lastPathLengthCacheClear > 60000) {
      this._pathLengthCache.clear();
      this._lastPathLengthCacheClear = a;
    }
    let s = 0;
    for (let i = 0; i < t.length && t[i] <= e; i++) {
      s = i;
    }
    this._pathLengthCache.set(i, s);
    this._framePathLengthCache.set(i, s);
    return s;
  }
  _draw_lane_lines() {
    window.debug;
    if (!this._lane_debug_logged) {
      this._lane_debug_logged = true;
    }
    if (this._use_simple_lines) {
      this._batch_draw_all_lines();
    } else {
      this._lane_lines.forEach((t, e) => {
        if (t.projected_points.length === 0) {
          return;
        }
        const i = c(this._lane_line_probs[e], 0, 0.7);
        this._draw_polygon(t.projected_points, `rgba(255, 255, 255, ${i})`);
      });
      this._road_edges.forEach((t, e) => {
        if (t.projected_points.length === 0) {
          return;
        }
        const i = c(1 - this._road_edge_stds[e], 0, 1);
        this._draw_polygon(t.projected_points, `rgba(255, 0, 0, ${i})`);
      });
    }
  }
  _batch_draw_all_lines() {
    const t = [];
    this._lane_lines.forEach((e, i) => {
      if (e.raw_points.length < 2) {
        return;
      }
      const a = this._lane_line_probs[i];
      if (a < 0.1) {
        return;
      }
      const s = c(a, 0, 0.7);
      t.push({
        points: e.raw_points,
        color: `rgba(255, 255, 255, ${s})`,
        lineWidth: 4
      });
    });
    this._road_edges.forEach((e, i) => {
      if (e.raw_points.length < 2) {
        return;
      }
      const a = this._road_edge_stds[i];
      if (a > 0.9) {
        return;
      }
      const s = c(1 - a, 0, 1);
      t.push({
        points: e.raw_points,
        color: `rgba(255, 0, 0, ${s})`,
        lineWidth: 4
      });
    });
    if (t.length === 0) {
      return;
    }
    let e = 0;
    const i = [];
    for (const a of t) {
      const t = [];
      for (let e = 0; e < a.points.length; e++) {
        const i = a.points[e];
        if (i[0] >= 0 && i[0] <= 100) {
          t.push(e);
        }
      }
      if (t.length >= 2) {
        i.push({
          ...a,
          validIndices: t,
          startIdx: e,
          numPoints: t.length
        });
        e += t.length;
      }
    }
    if (e === 0) {
      return;
    }
    const a = new Float32Array(e);
    const s = new Float32Array(e);
    const n = new Float32Array(e);
    let r = 0;
    for (const t of i) {
      for (const e of t.validIndices) {
        const i = t.points[e];
        a[r] = i[0];
        s[r] = i[1];
        n[r] = i[2];
        r++;
      }
    }
    const o = this._batch_transform(a, s, n, e);
    const l = this.ctx;
    for (const t of i) {
      l.strokeStyle = t.color;
      l.lineWidth = t.lineWidth;
      l.beginPath();
      let e = false;
      for (let i = 0; i < t.numPoints; i++) {
        const a = t.startIdx + i;
        const s = o.points[a];
        if (s.valid && Math.abs(s.x) < 5000 && Math.abs(s.y) < 5000) {
          if (e) {
            if (i > 0 && t.validIndices[i] - t.validIndices[i - 1] === 1) {
              l.lineTo(s.x, s.y);
            } else {
              l.stroke();
              l.beginPath();
              l.moveTo(s.x, s.y);
            }
          } else {
            l.moveTo(s.x, s.y);
            e = true;
          }
        } else if (e) {
          l.stroke();
          l.beginPath();
          e = false;
        }
      }
      if (e) {
        l.stroke();
      }
    }
  }
  _draw_path(t) {
    window.debug;
    if (this._path.projected_points.length !== 0) {
      if (this._experimental_mode) {
        if (this._exp_gradient.colors.length > 2) {
          this._draw_polygon_gradient(this._path.projected_points, this._exp_gradient);
        } else {
          this._draw_polygon(this._path.projected_points, "rgba(255, 255, 255, 0.12)");
        }
      } else {
        const e = t.longitudinalPlan && t.longitudinalPlan.allowThrottle || !this._longitudinal_control;
        if (e !== this._prev_allow_throttle) {
          this._prev_allow_throttle = e;
          this._blend_factor = Math.max(1 - this._blend_factor, 0);
        }
        if (this._blend_factor < 1) {
          this._blend_factor = Math.min(this._blend_factor + n, 1);
        }
        const i = e ? o : r;
        const a = e ? r : o;
        const s = {
          start: [0, 1],
          end: [0, 0],
          colors: this._blend_colors(i, a, this._blend_factor),
          stops: [0, 0.5, 1]
        };
        this._draw_polygon_gradient(this._path.projected_points, s);
      }
    }
  }
  _draw_polygon(t, e) {
    window.debug;
    if (t.length < 3) {
      return;
    }
    const i = this.ctx;
    i.fillStyle = e;
    const a = this._getCachedPath2D(t);
    i.fill(a);
  }
  _getCachedPath2D(t) {
    window.debug;
    const e = this._generatePointsHash(t);
    if (this._pathCache.has(e)) {
      return this._pathCache.get(e);
    }
    const i = new Path2D();
    i.moveTo(t[0][0], t[0][1]);
    for (let e = 1; e < t.length; e++) {
      i.lineTo(t[e][0], t[e][1]);
    }
    i.closePath();
    this._pathCache.set(e, i);
    if (this._pathCache.size > this._pathCacheMaxSize) {
      const t = this._pathCache.keys().next().value;
      this._pathCache.delete(t);
    }
    return i;
  }
  _generatePointsHash(t) {
    window.debug;
    if (t.length < 3) {
      return "empty";
    }
    const e = t[0];
    const i = t[Math.floor(t.length / 2)];
    const a = t[t.length - 1];
    const s = t => Math.round(t * 10) / 10;
    return `${t.length}:${s(e[0])},${s(e[1])}:${s(i[0])},${s(i[1])}:${s(a[0])},${s(a[1])}`;
  }
  _draw_simple_line(t, e, a = 2) {
    window.debug;
    if (t.length < 2) {
      return;
    }
    const s = this.ctx;
    s.strokeStyle = e;
    s.lineWidth = a;
    const n = Math.min(i, t[t.length - 1][0] || i);
    const r = [];
    const o = [];
    const l = [];
    const d = [];
    for (let e = 0; e < t.length; e++) {
      const i = t[e];
      if (i[0] >= 0 && i[0] <= n) {
        r.push(e);
        o.push(i[0]);
        l.push(i[1]);
        d.push(i[2]);
      }
    }
    if (r.length < 2) {
      return;
    }
    const h = this._batch_transform(new Float32Array(o), new Float32Array(l), new Float32Array(d), o.length);
    let c = false;
    s.beginPath();
    for (let t = 0; t < h.points.length; t++) {
      const e = h.points[t];
      if (e.valid && Math.abs(e.x) < 5000 && Math.abs(e.y) < 5000) {
        if (c) {
          if (t > 0 && r[t] - r[t - 1] === 1) {
            s.lineTo(e.x, e.y);
          } else {
            s.stroke();
            s.beginPath();
            s.moveTo(e.x, e.y);
          }
        } else {
          s.moveTo(e.x, e.y);
          c = true;
        }
      } else if (c) {
        s.stroke();
        s.beginPath();
        c = false;
      }
    }
    if (c) {
      s.stroke();
    }
  }
  _draw_polygon_gradient(t, e) {
    window.debug;
    if (t.length < 3) {
      return;
    }
    const i = this.ctx;
    const a = this._rect;
    const s = e.start[0] * a.width + a.x;
    const n = e.start[1] * a.height + a.y;
    const r = e.end[0] * a.width + a.x;
    const o = e.end[1] * a.height + a.y;
    const l = this._getCachedGradient(i, s, n, r, o, e);
    const d = this._getCachedPath2D(t);
    i.fillStyle = l;
    i.fill(d);
  }
  _getCachedGradient(t, e, i, a, s, n) {
    window.debug;
    const r = `${Math.round(e)},${Math.round(i)},${Math.round(a)},${Math.round(s)}:${n.colors.map(t => `${t.r},${t.g},${t.b},${t.a}`).join("|")}:${n.stops.join(",")}`;
    if (this._gradientCache.has(r)) {
      return this._gradientCache.get(r);
    }
    const o = t.createLinearGradient(e, i, a, s);
    for (let t = 0; t < n.stops.length; t++) {
      const e = n.colors[t];
      o.addColorStop(n.stops[t], `rgba(${e.r}, ${e.g}, ${e.b}, ${e.a / 255})`);
    }
    this._gradientCache.set(r, o);
    if (this._gradientCache.size > this._gradientCacheMaxSize) {
      const t = this._gradientCache.keys().next().value;
      this._gradientCache.delete(t);
    }
    return o;
  }
  _blend_colors(t, e, i) {
    window.debug;
    if (i >= 1) {
      return e;
    }
    if (i <= 0) {
      return t;
    }
    const a = 1 - i;
    return t.map((t, s) => {
      const n = e[s];
      return {
        r: Math.round(a * t.r + i * n.r),
        g: Math.round(a * t.g + i * n.g),
        b: Math.round(a * t.b + i * n.b),
        a: Math.round(a * t.a + i * n.a)
      };
    });
  }
  _update_experimental_gradient(t) {
    window.debug;
    this._exp_gradient.colors = [];
    this._exp_gradient.stops = [];
  }
  _update_lead_vehicle(t, e, i, a) {
    window.debug;
    const s = c(750 / (t / 3 + 30), 15, 30) * 1.57 * 1;
    if (!this._lead_size_logged) {
      this._lead_size_logged = true;
    }
    const n = c(i[0], 0, a.width - s / 2);
    const r = Math.min(i[1], a.height - s * 0.6);
    const o = s / 5;
    const l = s / 10;
    let d = 0;
    if (t < 40) {
      d = (1 - t / 40) * 255;
      if (e < 0) {
        d += e / 10 * -1 * 255;
      }
      d = Math.min(d, 255);
    }
    return {
      glow: [[n + s * 1.35 + o, r + s + l], [n, r - l], [n - s * 1.35 - o, r + s + l]],
      chevron: [[n + s * 1.25, r + s], [n, r], [n - s * 1.25, r + s]],
      fill_alpha: d
    };
  }
  _draw_lead_indicator() {
    window.debug;
    if (!this._lead_debug_logged) {
      this._lead_debug_logged = true;
    }
    this._lead_vehicles.forEach(t => {
      if (t.glow && t.chevron) {
        this._draw_triangle_fan(t.glow, "rgba(218, 202, 37, 1)");
        this._draw_triangle_fan(t.chevron, `rgba(201, 34, 49, ${t.fill_alpha / 255})`);
      }
    });
  }
  _draw_triangle_fan(t, e) {
    window.debug;
    if (t.length < 3) {
      return;
    }
    const i = this.ctx;
    i.fillStyle = e;
    const a = t[0];
    const s = new Path2D();
    for (let e = 1; e < t.length - 1; e++) {
      s.moveTo(a[0], a[1]);
      s.lineTo(t[e][0], t[e][1]);
      s.lineTo(t[e + 1][0], t[e + 1][1]);
      s.closePath();
    }
    i.fill(s);
  }
}
window.ModelRenderer = p;
const f = 255;
const w = 0.621371;
const m = "–";
class C {
  constructor() {
    window.debug;
    this.is_cruise_set = false;
    this.is_cruise_available = false;
    this.set_speed = f;
    this.speed = 0;
    this.v_ego_cluster_seen = false;
    this._text_cache = new Map();
    this._click_callback = null;
    this._gradientCache = null;
    this._gradientRect = null;
    this._offscreenCanvas = null;
    this._offscreenCtx = null;
    this._cachedState = {
      is_cruise_set: null,
      is_cruise_available: null,
      set_speed: null,
      speed: null,
      ui_status: null,
      is_metric: null,
      rect: null
    };
  }
  set_callbacks(t = null) {
    window.debug;
    this._click_callback = t;
  }
  render(t, e, i, a = true) {
    window.debug;
    this.ctx = i;
    this.is_metric = a;
    this._update_state(e);
    if (this._needsRedraw(t, a)) {
      this._ensureOffscreenCanvas(t);
      const e = this.ctx;
      this.ctx = this._offscreenCtx;
      this._offscreenCtx.clearRect(0, 0, t.width, t.height);
      this._draw_header_gradient(t);
      if (this.is_cruise_available) {
        this._draw_set_speed(t);
      }
      this._draw_current_speed(t);
      this.ctx = e;
      this._updateCachedState(t, a);
    }
    i.drawImage(this._offscreenCanvas, 0, 0);
    return this.handle_mouse_event(t);
  }
  _needsRedraw(t, e) {
    if (!this._cachedState.rect || this._cachedState.rect.width !== t.width || this._cachedState.rect.height !== t.height) {
      return true;
    }
    const i = this._get_ui_status();
    return this._cachedState.is_cruise_set !== this.is_cruise_set || this._cachedState.is_cruise_available !== this.is_cruise_available || Math.round(this._cachedState.set_speed || 0) !== Math.round(this.set_speed) || Math.round(this._cachedState.speed || 0) !== Math.round(this.speed) || this._cachedState.ui_status !== i || this._cachedState.is_metric !== e;
  }
  _updateCachedState(t, e) {
    this._cachedState = {
      is_cruise_set: this.is_cruise_set,
      is_cruise_available: this.is_cruise_available,
      set_speed: this.set_speed,
      speed: this.speed,
      ui_status: this._get_ui_status(),
      is_metric: e,
      rect: {
        width: t.width,
        height: t.height
      }
    };
  }
  _ensureOffscreenCanvas(t) {
    if (!(this._offscreenCanvas && this._offscreenCanvas.width === t.width && this._offscreenCanvas.height === t.height)) {
      this._offscreenCanvas = document.createElement("canvas");
      this._offscreenCanvas.width = t.width;
      this._offscreenCanvas.height = t.height;
      this._offscreenCtx = this._offscreenCanvas.getContext("2d");
      this._gradientCache = null;
      this._gradientRect = null;
    }
  }
  _update_state(t) {
    window.debug;
    if (!t.carState || !t.controlsState) {
      this.is_cruise_set = false;
      this.set_speed = f;
      this.speed = 0;
      return;
    }
    const e = t.controlsState;
    const i = t.carState;
    const a = i.vCruiseCluster || 0;
    this.set_speed = a === 0 ? e.vCruiseDEPRECATED || 0 : a;
    this.is_cruise_set = this.set_speed > 0 && this.set_speed < f;
    this.is_cruise_available = this.set_speed !== -1;
    if (this.is_cruise_set && !this.is_metric) {
      this.set_speed *= w;
    }
    const s = i.vEgoCluster || 0;
    this.v_ego_cluster_seen = this.v_ego_cluster_seen || s !== 0;
    const n = this.v_ego_cluster_seen ? s : i.vEgo || 0;
    const r = this.is_metric ? 3.6 : 2.236936;
    this.speed = Math.max(0, n * r);
  }
  _draw_header_gradient(t) {
    window.debug;
    if (!(this._gradientCache && this._gradientRect && this._gradientRect.width === t.width && this._gradientRect.height === t.height)) {
      this._gradientCache = this.ctx.createLinearGradient(t.x, t.y, t.x, t.y + 150);
      this._gradientCache.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      this._gradientCache.addColorStop(1, "rgba(0, 0, 0, 0)");
      this._gradientRect = {
        width: t.width,
        height: t.height
      };
    }
    this.ctx.fillStyle = this._gradientCache;
    this.ctx.fillRect(t.x, t.y, t.width, 150);
  }
  _draw_set_speed(t) {
    window.debug;
    const e = this.is_metric ? 100 : 86;
    const i = t.x + 30 + (86 - e) / 2;
    const a = t.y + 22;
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    this._draw_rounded_rect(i, a, e, 102, 10);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.29)";
    this.ctx.lineWidth = 3;
    this._stroke_rounded_rect(i, a, e, 102, 10);
    let s = "rgba(166, 166, 166, 1)";
    let n = "rgba(114, 114, 114, 1)";
    if (this.is_cruise_set) {
      n = "rgba(255, 255, 255, 1)";
      const t = this._get_ui_status();
      s = t === "ENGAGED" ? "rgba(128, 216, 166, 1)" : t === "OVERRIDE" ? "rgba(145, 155, 149, 1)" : "rgba(145, 155, 149, 1)";
    }
    this.ctx.fillStyle = s;
    this.ctx.font = `600 ${20}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("MAX", i + e / 2, a + 23);
    const r = this.is_cruise_set ? Math.round(this.set_speed).toString() : m;
    this.ctx.fillStyle = n;
    this.ctx.font = `bold ${45}px Arial`;
    this.ctx.fillText(r, i + e / 2, a + 61);
  }
  _draw_current_speed(t) {
    window.debug;
    const e = Math.round(this.speed).toString();
    this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
    this.ctx.font = `bold ${88}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(e, t.x + t.width / 2, t.y + 22 + 44);
    const i = this.is_metric ? "km/h" : "mph";
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    this.ctx.font = `500 ${33}px Arial`;
    this.ctx.fillText(i, t.x + t.width / 2, t.y + 22 + 88 + 15);
  }
  _draw_wheel(t, e, i, a) {
    window.debug;
    const s = a.selfdriveState;
    const n = !!s && s.experimentalMode;
    const r = !!s && s.enabled;
    let o = "rgba(145, 155, 149, 1)";
    let l = 0.2;
    if (r) {
      o = n ? "rgba(128, 216, 166, 1)" : "rgba(255, 255, 255, 1)";
      l = n ? 1 : 0.6;
    }
    const d = this._parse_rgba(o);
    this.ctx.strokeStyle = `rgba(${d.r}, ${d.g}, ${d.b}, ${l})`;
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(t, e, i, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(t, e, i * 0.4, 0, Math.PI * 2);
    this.ctx.stroke();
    for (let a = 0; a < 3; a++) {
      const s = (a * 120 - 90) * Math.PI / 180;
      this.ctx.beginPath();
      this.ctx.moveTo(t + Math.cos(s) * i * 0.4, e + Math.sin(s) * i * 0.4);
      this.ctx.lineTo(t + Math.cos(s) * i, e + Math.sin(s) * i);
      this.ctx.stroke();
    }
  }
  handle_mouse_event(t) {
    window.debug;
    if (!this._click_callback) {
      return false;
    }
    t.x;
    t.width;
    t.y;
    return false;
  }
  _get_ui_status() {
    window.debug;
    const t = window.selfdriveStateData;
    if (t) {
      if (t.enabled) {
        return "ENGAGED";
      } else if (t.activeOverride) {
        return "OVERRIDE";
      } else {
        return "DISENGAGED";
      }
    } else {
      return "DISENGAGED";
    }
  }
  _draw_rounded_rect(t, e, i, a, s) {
    window.debug;
    this.ctx.beginPath();
    this.ctx.moveTo(t + s, e);
    this.ctx.arcTo(t + i, e, t + i, e + a, s);
    this.ctx.arcTo(t + i, e + a, t, e + a, s);
    this.ctx.arcTo(t, e + a, t, e, s);
    this.ctx.arcTo(t, e, t + i, e, s);
    this.ctx.closePath();
    this.ctx.fill();
  }
  _stroke_rounded_rect(t, e, i, a, s) {
    window.debug;
    this.ctx.beginPath();
    this.ctx.moveTo(t + s, e);
    this.ctx.arcTo(t + i, e, t + i, e + a, s);
    this.ctx.arcTo(t + i, e + a, t, e + a, s);
    this.ctx.arcTo(t, e + a, t, e, s);
    this.ctx.arcTo(t, e, t + i, e, s);
    this.ctx.closePath();
    this.ctx.stroke();
  }
  _parse_rgba(t) {
    window.debug;
    const e = t.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (e) {
      return {
        r: parseInt(e[1]),
        g: parseInt(e[2]),
        b: parseInt(e[3]),
        a: e[4] ? parseFloat(e[4]) : 1
      };
    } else {
      return {
        r: 255,
        g: 255,
        b: 255,
        a: 1
      };
    }
  }
}
window.HudRenderer = C;
const S = 27;
const E = 40;
const M = 30;
const T = 20;
const L = 36;
const P = 36;
const $ = 24;
const A = 66;
const I = 78;
const D = 48;
const R = 5;
const k = 10;
const F = {
  normal: "rgba(0, 0, 0, 0.92)",
  userPrompt: "rgba(254, 140, 52, 0.92)",
  cricital: "rgba(201, 34, 49, 0.92)"
};
const G = {
  text1: "openpilot Unavailable",
  text2: "Waiting to start",
  size: "mid",
  status: "normal"
};
const V = {
  text1: "TAKE CONTROL IMMEDIATELY",
  text2: "System Unresponsive",
  size: "full",
  status: "cricital"
};
const O = {
  text1: "System Unresponsive",
  text2: "Reboot Device",
  size: "full",
  status: "cricital"
};
class j {
  constructor() {
    window.debug;
    this.started_time = 0;
    this.last_selfdrive_time = 0;
    this._offscreenCanvas = null;
    this._offscreenCtx = null;
    this._cachedAlert = null;
    this._cachedRect = null;
  }
  render(t, e, i) {
    window.debug;
    this.ctx = i;
    const a = this.get_alert(e);
    if (!a) {
      this._cachedAlert = null;
      return false;
    }
    if (this._needsRedraw(a, t)) {
      this._ensureOffscreenCanvas(t);
      const e = this.ctx;
      this.ctx = this._offscreenCtx;
      this._offscreenCtx.clearRect(0, 0, t.width, t.height);
      const i = this._get_alert_rect(t, a.size);
      this._draw_background(i, a);
      const s = {
        x: i.x + E,
        y: i.y + E,
        width: i.width - 80,
        height: i.height - 80
      };
      this._draw_text(s, a);
      this.ctx = e;
      this._cachedAlert = {
        text1: a.text1,
        text2: a.text2,
        size: a.size,
        status: a.status
      };
      this._cachedRect = {
        width: t.width,
        height: t.height
      };
    }
    i.drawImage(this._offscreenCanvas, 0, 0);
    return true;
  }
  _needsRedraw(t, e) {
    return !this._cachedRect || this._cachedRect.width !== e.width || this._cachedRect.height !== e.height || !this._cachedAlert || this._cachedAlert.text1 !== t.text1 || this._cachedAlert.text2 !== t.text2 || this._cachedAlert.size !== t.size || this._cachedAlert.status !== t.status;
  }
  _ensureOffscreenCanvas(t) {
    if (!(this._offscreenCanvas && this._offscreenCanvas.width === t.width && this._offscreenCanvas.height === t.height)) {
      this._offscreenCanvas = document.createElement("canvas");
      this._offscreenCanvas.width = t.width;
      this._offscreenCanvas.height = t.height;
      this._offscreenCtx = this._offscreenCanvas.getContext("2d");
    }
  }
  get_alert(t) {
    window.debug;
    const e = Date.now();
    if (this.started_time === 0 && t.selfdriveState) {
      this.started_time = e;
    }
    if (!t.selfdriveState) {
      if (this.started_time > 0 && e - this.started_time > 5000) {
        return G;
      } else {
        return null;
      }
    }
    if (t.updated && t.updated.selfdriveState) {
      this.last_selfdrive_time = e;
    }
    const i = t.deviceState;
    if (i && ["tici", "tizi", "mici"].includes(i.deviceType) && this.last_selfdrive_time > 0) {
      const i = (e - this.last_selfdrive_time) / 1000;
      if (i > 5) {
        const e = t.selfdriveState;
        if (e && e.enabled && i - 5 < k) {
          return V;
        } else {
          return O;
        }
      }
    }
    const a = t.selfdriveState;
    if (a && a.alertSize !== "none" && a.alertText1) {
      return {
        text1: a.alertText1,
        text2: a.alertText2 || "",
        size: a.alertSize,
        status: a.alertStatus || "normal"
      };
    } else {
      return null;
    }
  }
  _get_alert_rect(t, e) {
    if (e === "full") {
      return t;
    } else {
      return {
        x: 0,
        y: t.height * 0.8,
        width: t.width,
        height: t.height * 0.2
      };
    }
  }
  _draw_background(t, e) {
    const i = F[e.status] || F.normal;
    this.ctx.fillStyle = i;
    this.ctx.fillRect(t.x, t.y, t.width, t.height);
  }
  _draw_text(t, e) {
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    if (e.size === "small") {
      this.ctx.font = "bold 36px Arial";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(e.text1, t.x + t.width / 2, t.y + t.height / 2);
    } else if (e.size === "mid") {
      const i = t.y + t.height / 3;
      const a = t.y + t.height * 2 / 3;
      this.ctx.font = "bold 36px Arial";
      this.ctx.textBaseline = "bottom";
      this.ctx.fillText(e.text1, t.x + t.width / 2, i);
      this.ctx.font = "24px Arial";
      this.ctx.textBaseline = "top";
      this.ctx.fillText(e.text2, t.x + t.width / 2, a);
    } else {
      const i = e.text1.length > 15 ? A : I;
      this.ctx.font = `bold ${i}px Arial`;
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(e.text1, t.x + t.width / 2, t.y + t.height / 2);
      this.ctx.font = "bold 48px Arial";
      this.ctx.textBaseline = "top";
      this.ctx.fillText(e.text2, t.x + t.width / 2, t.y + t.height * 2 / 3);
    }
  }
}
window.AlertRenderer = j;
const N = 8;
const H = "calibrated";
const W = [1.22];
const q = {
  DISENGAGED: {
    r: 23,
    g: 51,
    b: 73,
    a: 200
  },
  OVERRIDE: {
    r: 145,
    g: 155,
    b: 149,
    a: 241
  },
  ENGAGED: {
    r: 23,
    g: 134,
    b: 68,
    a: 241
  }
};
function c(t, e, i) {
  return Math.max(e, Math.min(i, t));
}
class U {
  constructor() {
    window.debug;
    this.device_camera = null;
    this.view_from_calib = [...g.map(t => [...t])];
    this._last_calib_time = 0;
    this._last_rect_dims = {
      width: 0,
      height: 0
    };
    this._cached_matrix = null;
    this._content_rect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.model_renderer = new p();
    this._hud_renderer = new C();
    this.alert_renderer = new j();
    this._click_callback = null;
  }
  render(t, e, i) {
    window.debug;
    this.sm = e;
    this.ctx = i;
    this._update_calibration();
    const a = t.width - 16;
    const s = t.height - 16;
    const n = this.device_camera || u.tici;
    const r = a / s;
    const o = n.fcam.width / n.fcam.height;
    let l = a;
    let d = s;
    let h = t.x + 8;
    let c = t.y + 8;
    if (r > o) {
      l = s * o;
      h = t.x + 8 + (a - l) / 2;
    } else {
      d = a / o;
      c = t.y + 8 + (s - d) / 2;
    }
    this._content_rect = {
      x: h,
      y: c,
      width: l,
      height: d
    };
    this._draw_border(t);
    i.save();
    i.beginPath();
    i.rect(Math.floor(t.x), Math.floor(t.y), Math.floor(t.width), Math.floor(t.height));
    i.clip();
    this._calc_frame_matrix();
    this.model_renderer.render(t, e, i);
    i.restore();
    this._hud_renderer.render(t, e, i, e.is_metric || false);
    this.alert_renderer.render(t, e, i);
    if (!this._hud_renderer.handle_mouse_event(t)) {
      this._click_callback;
    }
  }
  set_callbacks(t = null) {
    window.debug;
    this._click_callback = t;
  }
  invalidate_transform_cache() {
    window.debug;
    this._cached_matrix = null;
    this._last_rect_dims = {
      width: 0,
      height: 0
    };
    this._last_calib_time = 0;
    if (this.model_renderer) {
      this.model_renderer.clear_caches();
    }
    if (this.model_renderer) {
      this.model_renderer._transform_dirty = true;
    }
  }
  _update_calibration() {
    window.debug;
    const t = this.sm;
    if (!this.device_camera && t.seen && t.seen.roadCameraState && t.seen.deviceState) {
      const e = t.deviceState ? t.deviceState.deviceType : "tici";
      this.device_camera = e === "mici" ? u.mici : u.tici;
    }
    if (!t.liveCalibration) {
      return;
    }
    const e = t.liveCalibration;
    if (!e.rpyCalib || e.rpyCalib.length !== 3 || e.calStatus !== H) {
      if (e.calStatus !== H) {
        this.view_from_calib = [...g.map(t => [...t])];
      }
      return;
    }
    const i = _(e.rpyCalib);
    this.view_from_calib = l(g, i);
    this._cached_matrix = null;
  }
  _calc_frame_matrix() {
    window.debug;
    const t = this.sm.updated && this.sm.updated.liveCalibration;
    const e = this.sm.recv_frame ? this.sm.recv_frame.liveCalibration : Date.now();
    const i = this.ctx.canvas.width;
    const a = this.ctx.canvas.height;
    const s = {
      width: i,
      height: a
    };
    if (!t && this._last_calib_time === e && this._last_rect_dims.width === s.width && this._last_rect_dims.height === s.height && this._cached_matrix !== null) {
      return this._cached_matrix;
    }
    const n = this.device_camera || u.tici;
    const r = n.fcam.intrinsics;
    const o = n.fcam.width;
    const d = n.fcam.height;
    const h = this.view_from_calib;
    this._content_rect.x;
    this._content_rect.y;
    this._content_rect.width;
    this._content_rect.height;
    const c = Math.max(i / o, a / d);
    const _ = r[0][0] * c * 1.1;
    const g = l([[-_, 0, i / 2], [0, -_, a / 2], [0, 0, 1]], h);
    this.model_renderer.set_transform(g);
    this._last_calib_time = e;
    this._last_rect_dims = s;
    this._cached_matrix = g;
    return this._cached_matrix;
  }
  _draw_border(t) {
    window.debug;
    const e = this.sm.selfdriveState && this.sm.selfdriveState.engageable ? "ENGAGED" : "DISENGAGED";
    const i = q[e] || q.DISENGAGED;
    this.ctx.strokeStyle = `rgba(${i.r}, ${i.g}, ${i.b}, ${i.a / 255})`;
    this.ctx.lineWidth = 8;
    this.ctx.strokeRect(t.x, t.y, t.width, t.height);
  }
}
window.AugmentedRoadView = U;
const X = new URLSearchParams(window.location.search);
const Y = X.get("debug") === "true";
const J = localStorage.getItem("debug") === "true";
window.debug = Y || J || false;
if (Y !== J) {
  if (Y) {
    localStorage.setItem("debug", "true");
  } else if (X.has("debug")) {
    localStorage.removeItem("debug");
  }
}
window._originalConsoleLog = console.log;
console.log = function (...t) {
  if (window.debug) {
    window._originalConsoleLog(...t);
  }
};
if (window.debug) {
  window._originalConsoleLog("%c🐛 Debug Mode Enabled", "color: #00ff00; font-weight: bold; font-size: 16px");
  window._originalConsoleLog("To disable: add ?debug=false to URL or run dashy.debug(false)");
  const t = document.createElement("div");
  t.id = "debug-indicator";
  t.textContent = "🐛 DEBUG";
  t.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                pointer-events: none;
            `;
  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(t);
  });
}
window.dashy = {
  debug: function (t = true) {
    window.debug = t;
    if (t) {
      localStorage.setItem("debug", "true");
      window._originalConsoleLog("%c🐛 Debug Mode Enabled", "color: #00ff00; font-weight: bold");
      window._originalConsoleLog("Refresh page to see all debug logs");
    } else {
      localStorage.removeItem("debug");
      window._originalConsoleLog("%c🔇 Debug Mode Disabled", "color: #ff0000; font-weight: bold");
    }
    if (t) {
      return "Debug enabled";
    } else {
      return "Debug disabled";
    }
  },
  perf: function () {
    const t = {
      fps: window._fps || 0,
      frameTime: window._frameTime || 0,
      drawCalls: window._drawCalls || 0,
      canvasOps: window._canvasOps || 0
    };
    window._originalConsoleLog("%cPerformance Metrics", "color: #00aaff; font-weight: bold");
    window._originalConsoleLog(t);
    return t;
  },
  help: function () {
    window._originalConsoleLog("%cDashy Debug Commands:", "color: #ffaa00; font-weight: bold; font-size: 14px");
    window._originalConsoleLog("dashy.debug(true/false) - Enable/disable debug mode");
    window._originalConsoleLog("dashy.perf() - Show performance metrics");
    window._originalConsoleLog("dashy.help() - Show this help");
    window._originalConsoleLog("\nURL Parameters:");
    window._originalConsoleLog("?debug=true - Enable debug mode");
    window._originalConsoleLog("?debug=false - Disable debug mode");
  }
};
(function () {
  let t = 0;
  let e = null;
  let i = 0;
  function a(a, s, n) {
    const r = document.getElementById("driving-page");
    if (!r || !r.classList.contains("active")) {
      return;
    }
    const o = window.innerWidth;
    const l = window.innerHeight;
    if (a > o - 100 && s > l - 100) {
      const r = Date.now();
      if (r - i < 100) {
        window._originalConsoleLog(`[Debug Toggle] Ignoring duplicate ${n} event`);
        return;
      }
      i = r;
      t++;
      window._originalConsoleLog(`[Debug Toggle] ${n} count: ${t}/5 (at ${a},${s})`);
      if (e) {
        clearTimeout(e);
      }
      e = // TOLOOK
      setTimeout(() => {
        t = 0;
        window._originalConsoleLog("[Debug Toggle] Tap count reset to 0");
      }, 1000);
      if (t === 5) {
        t = 0;
        const e = !window.debug;
        window.dashy.debug(e);
        const i = document.createElement("div");
        i.textContent = e ? "🐛 Debug Enabled" : "🔇 Debug Disabled";
        i.style.cssText = `\n                            position: fixed;\n                            top: 50%;\n                            left: 50%;\n                            transform: translate(-50%, -50%);\n                            background: ${e ? "rgba(0, 255, 0, 0.9)" : "rgba(255, 0, 0, 0.9)"};\n                            color: white;\n                            padding: 20px 40px;\n                            border-radius: 10px;\n                            font-size: 24px;\n                            font-weight: bold;\n                            z-index: 10001;\n                            pointer-events: none;\n                        `;
        document.body.appendChild(i);
        if (navigator.vibrate) {
          navigator.vibrate(e ? [100, 50, 100] : [200]);
        }
        // TOLOOK
        setTimeout(() => {
          i.remove();
          location.reload();
        }, 1500);
      }
    }
  }
  document.addEventListener("touchstart", t => {
    const e = t.touches[0];
    if (e.clientX > window.innerWidth - 100 && e.clientY > window.innerHeight - 100) {
      a(e.clientX, e.clientY, "Touch");
      t.preventDefault();
    }
  }, {
    passive: false
  });
  document.addEventListener("click", t => {
    if (t.clientX > window.innerWidth - 100 && t.clientY > window.innerHeight - 100) {
      a(t.clientX, t.clientY, "Click");
    }
  });
})();
const Z = {
  sections: [{
    title: "Visual",
    settings: [{
      id: "HudModeEnabled",
      type: "toggle",
      label: "Heads-up Display (HUD) Mode",
      description: "Mirror the display for windshield projection.",
      defaultValue: false,
      storage: "local"
    }, {
      id: "ShowVideoInHud",
      type: "toggle",
      label: "Show Video",
      description: "Show or hide video stream in HUD mode.",
      defaultValue: true,
      storage: "local",
      indent: true,
      dependsOn: "HudModeEnabled"
    }]
  }]
};
const K = {
  events: {},
  on(t, e) {
    if (!this.events[t]) {
      this.events[t] = [];
    }
    this.events[t].push(e);
    return () => this.off(t, e);
  },
  off(t, e) {
    if (this.events[t]) {
      this.events[t] = this.events[t].filter(t => t !== e);
    }
  },
  emit(t, e) {
    if (this.events[t]) {
      this.events[t].forEach(t => t(e));
    }
  }
};
const Q = {
  _data: {
    settings: {},
    localSettings: {},
    ui: {
      currentPage: "files",
      navBarVisible: false,
      hudModeEnabled: false,
      showVideoInHud: true
    },
    files: {
      currentPath: "/",
      items: []
    }
  },
  get(t) {
    return t.split(".").reduce((t, e) => t?.[e], this._data);
  },
  set(t, e) {
    const i = t.split(".");
    const a = i.pop();
    const s = i.reduce((t, e) => {
      if (!t[e]) {
        t[e] = {};
      }
      return t[e];
    }, this._data);
    const n = s[a];
    if (n !== e) {
      s[a] = e;
      K.emit("state:change", {
        path: t,
        value: e,
        oldValue: n
      });
      K.emit(`state:${t}`, e);
    }
  },
  subscribe: (t, e) => K.on(`state:${t}`, e)
};
const tt = {
  fileRow: (t, e) => {
    const i = t.is_dir ? "📁" : t.name.endsWith(".ts") ? "🎞️" : "📄";
    const a = `${e}/${t.name}`.replace("//", "/");
    return `\n                    <tr>\n                        <td><span class="file-icon">${i}</span>${t.name.endsWith(".ts") ? `<a href="/api/play?file=${encodeURIComponent(a)}" target="_blank" class="play-button">▶</a>` : ""}</td>\n                        <td>${t.is_dir ? `<a href="#" data-path="${a}">${t.name}</a>` : `<a href="/download/${encodeURIComponent(a.startsWith("/") ? a.substring(1) : a)}" target="_blank" download="${t.name}">${t.name}</a>`}</td>\n                        <td>${t.mtime}</td>\n                        <td class="file-size" style="text-align:right;">${t.is_dir ? "-" : Dt(t.size)}</td>\n                    </tr>\n                `;
  },
  breadcrumb: t => {
    const e = t.split("/").filter(Boolean);
    let i = "";
    const a = ["<a href=\"#\" data-path=\"/\">root</a>"];
    e.forEach((t, s) => {
      i += "/" + t;
      if (s === e.length - 1) {
        a.push(t);
      } else {
        a.push(`<a href="#" data-path="${i}">${t}</a>`);
      }
    });
    return a.join(" / ");
  },
  alert: (t, e, i = "normal") => `\n                    <div class="alert ${{
    small: "alert-small",
    normal: "alert-normal",
    full: "alert-full"
  }[i]}">\n                        <h2>${t}</h2>\n                        ${e ? `<p>${e}</p>` : ""}\n                    </div>\n                `
};
function et(t, ...e) {
  const i = t(...e);
  const a = document.createElement("div");
  a.innerHTML = i;
  return a.firstElementChild || a.childNodes;
}
function it(t, e, i = {}) {
  const a = document.createElement(t);
  if (e) {
    a.className = e;
  }
  Object.entries(i).forEach(([t, e]) => {
    if (t === "dataset") {
      Object.entries(e).forEach(([t, e]) => {
        a.dataset[t] = e;
      });
    } else {
      a[t] = e;
    }
  });
  return a;
}
function at(t) {
  const e = it("label", "toggle-switch");
  const i = it("input", "", {
    type: "checkbox",
    dataset: {
      param: t.id
    }
  });
  if (t.storage) {
    i.dataset.storage = t.storage;
  }
  if (t.defaultValue) {
    i.checked = true;
  }
  const a = it("span", "toggle-slider");
  e.appendChild(i);
  e.appendChild(a);
  return e;
}
function st(t) {
  const e = it("div", "setting-control stepper", {
    dataset: {
      param: t.id
    }
  });
  if (t.min !== undefined) {
    e.dataset.min = t.min;
  }
  if (t.max !== undefined) {
    e.dataset.max = t.max;
  }
  const i = it("button", "", {
    dataset: {
      step: -t.step
    },
    textContent: "-"
  });
  const a = it("span", "stepper-value", {
    textContent: t.defaultValue
  });
  const s = it("button", "", {
    dataset: {
      step: t.step
    },
    textContent: "+"
  });
  e.appendChild(i);
  e.appendChild(a);
  e.appendChild(s);
  return e;
}
function nt(t) {
  const e = it("div", "setting-control btn-group", {
    dataset: {
      param: t.id
    }
  });
  if (t.storage) {
    e.dataset.storage = t.storage;
  }
  t.options.forEach(i => {
    const a = it("button", "", {
      dataset: {
        value: i.value
      },
      textContent: i.text
    });
    if (i.value === t.defaultValue) {
      a.classList.add("active");
    }
    e.appendChild(a);
  });
  return e;
}
function rt(t) {
  return it("input", "text-input", {
    type: "text",
    placeholder: t.placeholder || "",
    dataset: {
      param: t.id
    }
  });
}
function ot(t) {
  const e = it("div", "setting-item", {
    id: t.id === "ShowVideoInHud" ? "show-video-setting" : ""
  });
  if (t.indent) {
    e.style.marginLeft = "2rem";
  }
  if (t.dependsOn) {
    e.style.display = "none";
  }
  const i = it("div", "setting-label");
  const a = it("p", "", {
    textContent: t.label
  });
  const s = it("span", "", {
    textContent: t.description
  });
  i.appendChild(a);
  i.appendChild(s);
  const n = it("div", "setting-control");
  let r;
  switch (t.type) {
    case "toggle":
      r = at(t);
      break;
    case "stepper":
      r = st(t);
      e.appendChild(i);
      e.appendChild(r);
      return e;
    case "btn-group":
      r = nt(t);
      e.appendChild(i);
      e.appendChild(r);
      return e;
    case "text-input":
      r = rt(t);
      n.appendChild(r);
  }
  if (t.type === "toggle") {
    n.appendChild(r);
  }
  e.appendChild(i);
  e.appendChild(n);
  return e;
}
function lt(t, e) {
  t.sections.forEach(t => {
    const i = it("div", "settings-category");
    const a = it("h2", "", {
      textContent: t.title
    });
    i.appendChild(a);
    t.settings.forEach(t => {
      i.appendChild(ot(t));
    });
    e.appendChild(i);
  });
}
const dt = document.getElementById("app-container");
const ht = document.getElementById("driving-page");
const ct = document.getElementById("files-page");
const _t = document.getElementById("settings-page");
const gt = document.getElementById("local-settings-page");
const ut = document.getElementById("nav-driving");
const pt = document.getElementById("nav-files");
const ft = document.getElementById("nav-settings");
const wt = document.getElementById("nav-local-settings");
const mt = document.getElementById("files-breadcrumbs");
const bt = document.querySelector("#files-table tbody");
const vt = document.getElementById("driving-page-content");
const xt = document.getElementById("videoPlayer");
const yt = document.getElementById("uiCanvas");
const Ct = yt.getContext("2d");
function St() {
  window.debug;
  document.addEventListener("click", t => {
    if (t.target.matches("nav button")) {
      const e = t.target.id.replace("nav-", "");
      It(e);
      return;
    }
    if (t.target.matches(".stepper button")) {
      const e = t.target.parentElement;
      const i = e.querySelector(".stepper-value");
      const a = parseFloat(t.target.dataset.step);
      const s = parseFloat(e.dataset.min) || -Infinity;
      const n = parseFloat(e.dataset.max) || Infinity;
      let r = parseFloat(i.textContent) + a;
      if (String(a).includes(".")) {
        r = parseFloat(r.toFixed(2));
      }
      i.textContent = Math.max(s, Math.min(n, r));
      const o = t.target.closest("[data-param]");
      if (o && o.dataset.storage === "local") {
        Le(() => {
          const t = o.dataset.param;
          const e = Et(true)[t];
          if (e !== undefined) {
            Mt(t, e);
          }
        }, 50);
      }
      return;
    }
    if (t.target.matches(".btn-group button")) {
      t.target.parentElement.querySelectorAll("button").forEach(t => t.classList.remove("active"));
      t.target.classList.add("active");
      const e = t.target.closest("[data-param]");
      if (e && e.dataset.storage === "local") {
        Le(() => {
          const t = e.dataset.param;
          const i = Et(true)[t];
          if (i !== undefined) {
            Mt(t, i);
          }
        }, 50);
      }
      return;
    }
    if (t.target.matches("#files-table a, #files-breadcrumbs a")) {
      if (t.target.href && t.target.href.includes("/api/play")) {
        return;
      }
      const e = t.target.dataset.path;
      if (e !== undefined) {
        t.preventDefault();
        Bt(e);
      }
      return;
    }
  });
  document.addEventListener("change", t => {
    const e = t.target.closest("[data-param]");
    if (e && e.dataset.storage === "local") {
      Le(() => {
        const t = e.dataset.param;
        const i = Et(true)[t];
        if (i !== undefined) {
          Mt(t, i);
        }
      }, 50);
    }
  });
  document.addEventListener("input", t => {
    const e = t.target.closest("[data-param][data-storage=\"local\"]");
    if (e && t.target.matches(".text-input")) {
      Mt(e.dataset.param, t.target.value);
    }
  });
}
function Et(t = true) {
  window.debug;
  const e = {};
  const i = t ? "[data-param][data-storage=\"local\"]" : "[data-param]:not([data-storage=\"local\"])";
  document.querySelectorAll(i).forEach(t => {
    const i = t.dataset.param;
    if (t.matches("input[type=\"checkbox\"]")) {
      e[i] = t.checked;
    } else if (t.matches(".stepper")) {
      e[i] = parseFloat(t.querySelector(".stepper-value").textContent);
    } else if (t.matches(".btn-group")) {
      e[i] = t.querySelector("button.active").dataset.value;
    } else if (t.matches(".text-input")) {
      e[i] = t.value;
    }
  });
  return e;
}
function Mt(t, e) {
  window.debug;
  try {
    let i = JSON.parse(localStorage.getItem("dashySettings")) || {};
    i[t] = e;
    localStorage.setItem("dashySettings", JSON.stringify(i));
    Pt(t, e);
  } catch (t) {}
}
let Tt;
function Lt() {
  const t = Q.get("ui.hudModeEnabled");
  const e = Q.get("ui.showVideoInHud");
  xt.style.display = t && !e ? "none" : "";
}
function Pt(t, e) {
  window.debug;
  Q.set(`ui.${t.charAt(0).toLowerCase() + t.slice(1)}`, e);
}
function $t() {
  Q.subscribe("ui.theme", t => {});
  Q.subscribe("ui.hudModeEnabled", t => {
    if (t) {
      xt.classList.add("hud-mode");
      const t = document.getElementById("show-video-setting");
      if (t) {
        t.style.display = "";
      }
    } else {
      xt.classList.remove("hud-mode");
      const t = document.getElementById("show-video-setting");
      if (t) {
        t.style.display = "none";
      }
      xt.style.display = "";
    }
    Lt();
  });
  Q.subscribe("ui.showVideoInHud", t => {
    Lt();
  });
  Q.subscribe("ui.navBarVisible", t => {
    K.emit("nav:visibility", t);
  });
  Q.subscribe("ui.currentPage", t => {
    K.emit("page:change", t);
  });
}
function At() {
  window.debug;
  try {
    const t = JSON.parse(localStorage.getItem("dashySettings")) || {};
    for (const [e, i] of Object.entries(t)) {
      const t = document.querySelector(`[data-param="${e}"][data-storage="local"]`);
      if (t) {
        if (t.matches("input[type=\"checkbox\"]")) {
          t.checked = i;
        } else if (t.matches(".stepper")) {
          t.querySelector(".stepper-value").textContent = i;
        } else if (t.matches(".btn-group")) {
          t.querySelectorAll("button").forEach(t => t.classList.remove("active"));
          const e = t.querySelector(`[data-value="${i}"]`);
          if (e) {
            e.classList.add("active");
          }
        } else if (t.matches(".text-input")) {
          t.value = i;
        }
      }
      Pt(e, i);
    }
    if (Q.get("ui.hudModeEnabled")) {
      document.getElementById("show-video-setting").style.display = "";
    } else {
      document.getElementById("show-video-setting").style.display = "none";
    }
  } catch (t) {}
}
function It(t) {
  window.debug;
  document.querySelectorAll(".page").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("nav button").forEach(t => t.classList.remove("active"));
  document.getElementById(`${t}-page`).classList.add("active");
  document.getElementById(`nav-${t}`).classList.add("active");
  if (!(t !== "files" || bt.hasChildNodes())) {
    Bt("/");
  }
  if (t === "driving") {
    Me.classList.remove("visible");
    $e(Te);
  } else {
    Me.classList.add("visible");
    $e(Te);
  }
}
function Dt(t) {
  if (t === 0) {
    return "0 B";
  }
  const e = Math.floor(Math.log(t) / Math.log(1024));
  return parseFloat((t / Math.pow(1024, e)).toFixed(1)) + " " + ["B", "KB", "MB", "GB", "TB"][e];
}
function Rt(t) {
  window.debug;
  if (Nt === t) {
    return;
  }
  Nt = t;
  const e = t === 1 || t === "1";
  const i = t === 2 || t === "2";
  if (ut) {
    ut.style.display = i ? "" : "none";
  }
  if (wt) {
    wt.style.display = i ? "" : "none";
  }
  if (pt) {
    pt.style.display = "";
  }
  if (ft) {
    ft.style.display = e || i ? "none" : "";
  }
  let a = "driving";
  if (Q.get("ui.currentPage") !== a) {
    It(a);
  }
}
function kt(t, e) {
  let i;
  return function (...a) {
    clearTimeout(i);
    i = // TOLOOK
    setTimeout(() => {
      clearTimeout(i);
      t(...a);
    }, e);
  };
}
const zt = new Map();
async function Bt(t = "/") {
  window.debug;
  const e = zt.get(t);
  if (e) {
    e.abort();
  }
  const i = new AbortController();
  zt.set(t, i);
  try {
    bt.innerHTML = "<tr><td colspan=\"4\" style=\"text-align:center;\">Loading...</td></tr>";
    const e = await fetch(`/api/files?path=${encodeURIComponent(t)}`, {
      signal: i.signal
    });
    if (!e.ok) {
      throw new Error(`Server error: ${e.statusText}`);
    }
    const a = await e.json();
    Ft(a.path);
    Gt(a.path, a.files);
  } catch (t) {
    if (t.name === "AbortError") {
      return;
    }
    bt.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#e53e3e;">Failed to load files: ${t.message}</td></tr>`;
  } finally {
    zt.delete(t);
  }
}
function Ft(t) {
  mt.innerHTML = "<strong>Path:</strong> " + tt.breadcrumb(t);
  Q.set("files.currentPath", t);
}
function Gt(t, e) {
  Q.set("files.items", e);
  let i = "";
  if (t) {
    const e = t.substring(0, t.lastIndexOf("/")) || "/";
    i += `<tr><td><span class="file-icon">⤴️</span></td><td><a href="#" data-path="${e}">.. (Parent Directory)</a></td><td></td><td></td></tr>`;
  }
  e.forEach(e => {
    i += tt.fileRow(e, t);
  });
  bt.innerHTML = i;
}
let Vt;
let Ot;
let jt = false;
let Nt = null;
let Ht = null;
let Wt = null;
const qt = {
  modelV2: null,
  liveCalibration: null,
  longitudinalPlan: null,
  radarState: null,
  selfdriveState: null,
  deviceState: null,
  carState: null,
  controlsState: null,
  roadCameraState: null,
  driverStateV2: null,
  driverMonitoringState: null,
  recv_frame: {},
  recv_time: {},
  updated: {},
  valid: {},
  seen: {},
  frame: 0
};
let Ut = 0;
let Xt = 0;
let Yt = 0;
let Jt = 0;
let Zt = 0;
const Kt = {
  sm: qt,
  started_frame: 0,
  is_metric: false,
  status: "DISENGAGED",
  engaged: false
};
const Qt = {
  textContent: ""
};
const te = {
  style: {
    backgroundColor: ""
  }
};
const ee = 20;
const ie = 50;
let ae = 0;
let se = 0;
let ne = 0;
let re = false;
function oe() {
  window.debug;
  const {
    width: t,
    height: e
  } = vt.getBoundingClientRect();
  if (t > 0 && (yt.width !== t || yt.height !== e)) {
    yt.width = t;
    yt.height = e;
    if (Wt) {
      Wt.invalidate_transform_cache();
    }
    if (!Wt && yt.width > 0 && yt.height > 0) {
      Wt = new U();
      Wt.set_callbacks(() => {
        if (qt.selfdriveState) {
          qt.selfdriveState.experimentalMode = !qt.selfdriveState.experimentalMode;
        }
      });
      requestAnimationFrame(Fe);
    }
  }
}
const le = new ResizeObserver(() => oe());
function de() {
  window.debug;
  if (!Wt && yt.width > 0 && yt.height > 0) {
    Wt = new U();
    Wt.set_callbacks(() => {
      if (qt.selfdriveState) {
        qt.selfdriveState.experimentalMode = !qt.selfdriveState.experimentalMode;
      }
    });
    requestAnimationFrame(Fe);
  }
}
function he(t, e) {
  window.debug;
  Qt.textContent = t;
  const i = {
    green: "#48bb78",
    yellow: "#f6e05e",
    red: "#f56565"
  };
  te.style.backgroundColor = i[e] || i.red;
  we = true;
  $e(Tt);
  Tt = Le(() => {
    Qt.textContent = "";
    we = true;
  }, 5000);
}
le.observe(vt);
window.addEventListener("orientationchange", () => oe());
let ce = 0;
let _e = [];
const ge = 500;
function ue() {
  window.debug;
  const t = Date.now();
  if (t - ce < ge) {
    return _e;
  }
  ce = t;
  window.debug;
  const e = [];
  if (Yt > 0 && t - Yt > 2000) {
    e.push({
      text: "Model data stale",
      severity: "warning"
    });
  }
  if (Jt > 0 && t - Jt > 2000) {
    e.push({
      text: "Car state stale",
      severity: "warning"
    });
  }
  if (Zt > 0 && t - Zt > 3000) {
    e.push({
      text: "Selfdrive state stale",
      severity: "critical"
    });
  }
  _e = e;
  return e;
}
let pe = "";
let fe = "";
let we = true;
let me = null;
let be = null;
let ve = null;
function xe() {
  window.debug;
  const t = Qt.textContent;
  const e = te.style.backgroundColor;
  if (!(t === pe && e === fe)) {
    we = true;
    pe = t;
    fe = e;
  }
  const i = ue();
  if (i.length > 0 && !t) {
    const t = i.find(t => t.severity === "critical") || i[0];
    he(t.text, t.severity === "critical" ? "red" : "yellow");
    return;
  }
  if (t) {
    if (!(ve && ve.width === yt.width && ve.height === yt.height)) {
      we = true;
      ve = {
        width: yt.width,
        height: yt.height
      };
    }
    if (we) {
      we = false;
      const i = 12;
      const a = 4;
      const s = 12;
      Ct.font = `${s}px Arial`;
      const n = Ct.measureText(t).width + i * 2 + 6 + 4;
      const r = s + a * 2;
      if (!(me && me.width === n && me.height === r)) {
        me = document.createElement("canvas");
        me.width = n;
        me.height = r;
        be = me.getContext("2d");
      }
      be.clearRect(0, 0, n, r);
      const o = 5;
      be.fillStyle = "rgba(0, 0, 0, 0.7)";
      be.beginPath();
      be.roundRect(0, 0, n, r, o);
      be.fill();
      const l = 3;
      const d = i + l;
      const h = r / 2;
      be.fillStyle = e;
      be.beginPath();
      be.arc(d, h, l, 0, Math.PI * 2);
      be.fill();
      be.fillStyle = "white";
      be.font = `${s}px Arial`;
      be.textAlign = "left";
      be.textBaseline = "middle";
      const c = d + l + 4;
      be.fillText(t, c, h);
    }
    if (me) {
      const t = 15;
      const e = yt.width / 2 - me.width / 2;
      const i = yt.height - me.height - t;
      Ct.drawImage(me, e, i);
    }
  }
}
function ye(t) {
  window.debug;
  const e = t.split("\r\n");
  let i = -1;
  const a = [];
  for (let t = 0; t < e.length; t++) {
    if (e[t].startsWith("m=video")) {
      i = t;
    } else if (e[t].includes("H264/90000")) {
      const i = e[t].match(/a=rtpmap:(\d+) H264\/90000/);
      if (i && i[1]) {
        a.push(i[1]);
      }
    }
  }
  if (i === -1 || a.length === 0) {
    return t;
  }
  const s = [];
  for (const t of a) {
    for (let i = 0; i < e.length; i++) {
      if (e[i].includes(`apt=${t}`) && e[i].includes("rtx/90000")) {
        const t = e[i].match(/a=rtpmap:(\d+) rtx\/90000/);
        if (t && t[1]) {
          s.push(t[1]);
        }
      }
    }
  }
  const n = [...a, ...s];
  const r = e[i].split(" ");
  const o = r.slice(3).filter(t => !n.includes(t));
  const l = r.slice(0, 3).concat(n, o).join(" ");
  e[i] = l;
  return e.join("\r\n");
}
const Ce = new Set();
const Se = new Set();
let Ee;
let Me;
let Te;
function Le(t, e) {
  const i = // TOLOOK
  setTimeout(() => {
    t();
    Ce.delete(i);
  }, e);
  Ce.add(i);
  return i;
}
function Pe(t, e) {
  const i = // TOLOOK
  setInterval(t, e);
  Se.add(i);
  return i;
}
function $e(t) {
  clearTimeout(t);
  Ce.delete(t);
}
function Ae(t) {
  clearInterval(t);
  Se.delete(t);
}
function Ie() {
  window.debug;
  Ce.forEach(t => clearTimeout(t));
  Ce.clear();
  Se.forEach(t => clearInterval(t));
  Se.clear();
  clearTimeout(Ee);
  clearInterval(Ht);
  Ht = null;
  if (Vt) {
    Vt.close();
    Vt = null;
  }
  if (Ot) {
    Ot.close();
    Ot = null;
  }
  Wt = null;
  if (window.animationFrameId) {
    cancelAnimationFrame(window.animationFrameId);
  }
}
function De() {
  window.debug;
  const t = window.location.hostname;
  Ie();
  if (!ht.classList.contains("active")) {
    if (Nt === 2) {
      It("driving");
    }
  }
  ke(t);
  de();
}
async function Re() {
  window.debug;
  const t = window.location.hostname;
  he(`Connecting to ${t}...`, "yellow");
  try {
    const e = await fetch(`/api/driving_init`, {
      method: "GET",
      signal: AbortSignal.timeout(5000)
    });
    if (!e.ok) {
      throw new Error(`Connection failed: ${e.statusText}`);
    }
    {
      const i = await e.json();
      jt = i.is_metric;
      Kt.is_metric = jt;
      if (i.dp_dev_dashy !== undefined) {
        Rt(i.dp_dev_dashy);
        if (i.dp_dev_dashy === 2) {
          ke(t);
        }
      } else {
        Rt(null);
      }
    }
  } catch (e) {
    he(`Could not connect to device at ${t}.`, "red");
  }
}
async function ke(t) {
  window.debug;
  he("Initializing WebRTC...", "yellow");
  clearTimeout(Ee);
  lastDataReceivedTime = Date.now();
  if (Vt) {
    Vt.close();
    Vt = null;
  }
  try {
    Vt = new RTCPeerConnection({
      iceServers: [{
        urls: "stun:stun.l.google.com:19302"
      }]
    });
    Be(Vt.createDataChannel("data"));
    Vt.ontrack = t => {
      if (t.track.kind === "video") {
        xt.srcObject = t.streams[0];
        oe();
        he("Video connected", "green");
        xt.onplaying = () => {
          clearTimeout(Ee);
        };
      }
    };
    Vt.onconnectionstatechange = () => {
      if (Vt.connectionState === "failed" || Vt.connectionState === "disconnected" || Vt.connectionState === "closed") {
        he("WebRTC Error: Could not connect to server (server may be down or inaccessible)", "red");
        if (Q.get("ui.currentPage") === "driving") {
          Ee = Le(() => De(), 5000);
        }
      } else if (Vt.connectionState === "connected") {
        he("WebRTC Connected", "green");
        clearTimeout(Ee);
      }
    };
    Vt.addTransceiver("video", {
      direction: "recvonly"
    });
    const e = await Vt.createOffer();
    e.sdp = ye(e.sdp);
    await Vt.setLocalDescription(e);
    const i = await fetch(`http://${t}:5001/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sdp: Vt.localDescription.sdp,
        cameras: ["road"],
        bridge_services_in: [],
        bridge_services_out: ["modelV2", "liveCalibration", "longitudinalPlan", "radarState", "selfdriveState", "deviceState", "carState", "controlsState"]
      })
    });
    if (!i.ok) {
      const t = await i.text();
      throw new Error(`HTTP Error! Status: ${i.status}, Message: ${t}`);
    }
    const a = await i.json();
    await Vt.setRemoteDescription(new RTCSessionDescription(a));
    ze();
  } catch (t) {
    let e = `WebRTC Error: ${t.message}`;
    if (t.message.includes("Failed to fetch")) {
      e = "WebRTC Error: Could not connect to server (server may be down or inaccessible)";
    }
    he(e, "red");
    if (t.message.includes("Failed to fetch") && Q.get("ui.currentPage") === "driving") {
      Ee = // TOLOOK
      setTimeout(() => De(), 5000);
    }
  }
}
function ze() {
  window.debug;
  Ae(Ht);
  lastDataReceivedTime = Date.now();
  lastVideoPlaybackTime = xt.currentTime;
  Ht = Pe(() => {
    let t = false;
    let e = "";
    if (Date.now() - lastDataReceivedTime > 5000) {
      t = true;
      e = "Data stream stalled";
    }
    if (!(t || xt.paused || xt.currentTime !== lastVideoPlaybackTime)) {
      t = true;
      e = "Video stream stalled";
    }
    if (t) {
      he(`${e}. Reconnecting...`, "yellow");
      De();
    }
    lastVideoPlaybackTime = xt.currentTime;
  }, 2000);
}
function Be(t) {
  window.debug;
  const e = new TextDecoder("utf-8");
  let i = "";
  function a(t) {
    try {
      const e = JSON.parse(t.replace(/\bNaN\b/g, "null"));
      lastDataReceivedTime = Date.now();
      const i = Date.now();
      if (e.data && e.data.dp_dev_dashy !== undefined) {
        Rt(e.data.dp_dev_dashy);
      }
      const a = e.type;
      qt[a] = e.data;
      qt.recv_frame[a] = qt.frame;
      qt.recv_time[a] = i / 1000;
      qt.updated[a] = true;
      qt.valid[a] = true;
      qt.seen[a] = true;
      if (a === "selfdriveState") {
        Zt = i;
        if (Ut === 0) {
          Ut = i;
          Xt = qt.frame;
        }
      } else if (a === "modelV2") {
        Yt = i;
      } else if (a === "carState") {
        Jt = i;
      }
      qt.frame++;
    } catch (t) {}
  }
  t.onmessage = t => {
    const s = typeof t.data == "string" ? t.data : e.decode(t.data, {
      stream: true
    });
    let n;
    for (i += s; (n = i.indexOf("}{")) !== -1;) {
      a(i.substring(0, n + 1));
      i = i.substring(n + 1);
    }
    if (i.length > 0) {
      a(i);
      i = "";
    }
  };
}
function Fe(t) {
  window.animationFrameId = requestAnimationFrame(Fe);
  const e = t - ae;
  if (!(e < ie) && (ae = t - e % ie, ht.classList.contains("active"))) {
    window.debug;
    Ct.save();
    Ct.clearRect(0, 0, yt.width, yt.height);
    if (Q.get("ui.hudModeEnabled")) {
      Ct.translate(0, yt.height);
      Ct.scale(1, -1);
    }
    Kt.is_metric = jt;
    Kt.frame = qt.frame;
    Kt.started_frame = Xt;
    if (qt.selfdriveState) {
      Kt.engaged = qt.selfdriveState.enabled || false;
      if (qt.selfdriveState.enabled) {
        Kt.status = "ENGAGED";
      } else if (qt.selfdriveState.activeOverride) {
        Kt.status = "OVERRIDE";
      } else {
        Kt.status = "DISENGAGED";
      }
    }
    if (Wt) {
      const t = {
        x: 0,
        y: 0,
        width: yt.width,
        height: yt.height
      };
      Wt.render(t, qt, Ct);
    }
    xe();
    Ct.restore();
    for (const t in qt.updated) {
      qt.updated[t] = false;
    }
  }
}
function It(t) {
  window.debug;
  const e = Q.get("ui.currentPage");
  Q.set("ui.currentPage", t);
  document.querySelectorAll(".page").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("nav button").forEach(t => t.classList.remove("active"));
  document.getElementById(`${t}-page`).classList.add("active");
  document.getElementById(`nav-${t}`).classList.add("active");
  if (!(t !== "files" || bt.hasChildNodes())) {
    Bt("/");
  }
  if (e === "driving" && t !== "driving") {
    Ie();
  }
  if (t === "driving" && e !== "driving") {
    De();
  }
  if (t === "driving") {
    Me.classList.remove("visible");
    Q.set("ui.navBarVisible", false);
    vt.addEventListener("click", Ge);
  } else {
    Me.classList.add("visible");
    Q.set("ui.navBarVisible", true);
    vt.removeEventListener("click", Ge);
    clearTimeout(Te);
  }
}
function Ge() {
  if (!Me) {
    Me = document.querySelector("nav");
  }
  Me.classList.toggle("visible");
  if (Me.classList.contains("visible")) {
    $e(Te);
    Te = Le(() => {
      Me.classList.remove("visible");
    }, 3000);
  } else {
    $e(Te);
  }
}
async function Ve() {
  window.debug;
  document.getElementById("settings-content");
  const t = document.getElementById("local-settings-content");
  lt(Z, t);
  Me = document.querySelector("nav");
  if (ut) {
    ut.style.display = "none";
  }
  if (wt) {
    wt.style.display = "none";
  }
  St();
  document.getElementById("driving-page-content").addEventListener("click", t => {
    if (ht.classList.contains("active")) {
      Ge();
    }
  });
  xt.addEventListener("click", t => {
    if (ht.classList.contains("active")) {
      Ge();
    }
  });
  yt.addEventListener("click", t => {
    if (ht.classList.contains("active")) {
      Ge();
    }
  });
  $t();
  At();
  await Re();
  It("driving");
  de();
  xt.onstalled = () => {
    if (Q.get("ui.currentPage") === "driving") {
      De();
    }
  };
  xt.onplaying = () => {
    clearTimeout(Ee);
  };
}
window.addEventListener("beforeunload", Ie);
window.addEventListener("unload", Ie);
Ve();