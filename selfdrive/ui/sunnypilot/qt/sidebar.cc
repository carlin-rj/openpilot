/**
 * Copyright (c) 2021-, Haibin Wen, sunnypilot, and a number of other contributors.
 *
 * This file is part of sunnypilot and is licensed under the MIT License.
 * See the LICENSE.md file in the root directory for more details.
 */

#include "selfdrive/ui/sunnypilot/qt/sidebar.h"

#include <sstream>
#include <functional>

#include "selfdrive/ui/qt/util.h"
#include "selfdrive/ui/sunnypilot/qt/util.h"
#include "common/params.h"

SidebarSP::SidebarSP(QWidget *parent) : Sidebar(parent) {
  // Redirect uiUpdate signal to SidebarSP::updateState instead of Sidebar::updateState
  QObject::disconnect(uiState(), &UIState::uiUpdate, this, &Sidebar::updateState);
  QObject::connect(uiStateSP(), &UIStateSP::uiUpdate, this, &SidebarSP::updateState);

  // Load sidebar configuration
  loadSidebarConfig();

  last_sidebar_config = params.get("SidebarMetricsConfig");
  // 轮询参数变化
  QTimer *configCheckTimer = new QTimer(this);
  connect(configCheckTimer, &QTimer::timeout, this, [this]() {
    std::string new_config = params.get("SidebarMetricsConfig");
    if (new_config != last_sidebar_config) {
      last_sidebar_config = new_config;
      loadSidebarConfig();     // 重新加载配置
      update();                // 重新绘制
    }
  });
  configCheckTimer->start(2000);  // 每3秒检查一次
}

void SidebarSP::updateState(const UIStateSP &s) {
  if (!isVisible()) return;
  Sidebar::updateState(s);

  ItemStatus sunnylinkStatus;
  auto sl_dongle_id = getSunnylinkDongleId();
  auto last_sunnylink_ping_str = params.get("LastSunnylinkPingTime");
  auto last_sunnylink_ping = std::stoull(last_sunnylink_ping_str.empty() ? "0" : last_sunnylink_ping_str);
  auto elapsed_sunnylink_ping = nanos_since_boot() - last_sunnylink_ping;
  auto sunnylink_enabled = params.getBool("SunnylinkEnabled");

  QString status = tr("DISABLED");
  QColor color = disabled_color;

  if (sunnylink_enabled && last_sunnylink_ping == 0) {
    // If sunnylink is enabled, but we don't have a dongle id, and we haven't received a ping yet, we are registering
    status = sl_dongle_id.has_value() ? tr("OFFLINE") : tr("REGIST...");
    color = sl_dongle_id.has_value() ? warning_color : progress_color;
  } else if (sunnylink_enabled) {
    // If sunnylink is enabled, we are considered online if we have received a ping in the last 80 seconds, else error.
    status = elapsed_sunnylink_ping < 80000000000ULL ? tr("ONLINE") : tr("ERROR");
    color = elapsed_sunnylink_ping < 80000000000ULL ? good_color : danger_color;
  }
  sunnylinkStatus = ItemStatus{{tr("SUNNYLINK"), status}, color};
  setProperty("sunnylinkStatus", QVariant::fromValue(sunnylinkStatus));
}

void SidebarSP::loadSidebarConfig() {
  // Load enabled metrics from params, default to original 5 metrics
  std::string config = params.get("SidebarMetricsConfig");
    // Parse comma-separated config
  enabled_metrics.clear();
  std::stringstream ss(config);
  std::string item;
  while (std::getline(ss, item, ',') && enabled_metrics.size() < MAX_METRICS) {
    QString qitem = QString::fromStdString(item).trimmed();
    enabled_metrics.push_back(qitem);
  }
}

std::vector<std::pair<QString, std::function<ItemStatus()>>> SidebarSP::getAvailableMetrics() {
  return {
    {"TEMP", [this]() { return temp_status; }},
    {"CPU", [this]() { return cpu_status; }},
    {"GPU", [this]() { return gpu_status; }},
    {"MEMORY", [this]() { return memory_status; }},
    {"STORAGE", [this]() { return free_status; }},
    {"PANDA", [this]() { return panda_status; }},
    {"CONNECT", [this]() { return connect_status; }},
    {"SUNNYLINK", [this]() { return sunnylink_status; }}
  };
}

void SidebarSP::drawSidebar(QPainter &p) {
  Sidebar::drawSidebar(p);

  auto available_metrics = getAvailableMetrics();
  int metric_count = 0;
  for (const QString &metric_name : enabled_metrics) {
    if (metric_count >= MAX_METRICS) break;

    for (const auto &metric : available_metrics) {
      if (metric.first == metric_name) {
        ItemStatus status = metric.second();
        int y_pos = METRIC_START_Y + (metric_count * METRIC_SPACING);
        drawMetric(p, status.first, status.second, y_pos);
        metric_count++;
        break;
      }
    }
  }
}
