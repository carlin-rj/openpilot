/**
 * Copyright (c) 2021-, Haibin Wen, sunnypilot, and a number of other contributors.
 *
 * This file is part of sunnypilot and is licensed under the MIT License.
 * See the LICENSE.md file in the root directory for more details.
 */

#include "selfdrive/ui/sunnypilot/qt/widgets/controls.h"

#include <QPainter>
#include <QStyleOption>

QFrame *horizontal_line(QWidget *parent) {
  QFrame *line = new QFrame(parent);
  line->setFrameShape(QFrame::StyledPanel);
  line->setStyleSheet(R"(
    border-width: 2px;
    border-bottom-style: solid;
    border-color: gray;
  )");
  line->setFixedHeight(10);
  return line;
}

QFrame *vertical_space(int height, QWidget *parent) {
  QFrame *v_space = new QFrame(parent);
  v_space->setFrameShape(QFrame::StyledPanel);
  v_space->setFixedHeight(height);
  return v_space;
}

// AbstractControlSP
std::vector<AbstractControlSP*> AbstractControlSP::advanced_controls_;
AbstractControlSP::~AbstractControlSP() { UnregisterAdvancedControl(this); }

void AbstractControlSP::RegisterAdvancedControl(AbstractControlSP *ctrl) { advanced_controls_.push_back(ctrl); }

void AbstractControlSP::UnregisterAdvancedControl(AbstractControlSP *ctrl) {
  advanced_controls_.erase(std::remove(advanced_controls_.begin(), advanced_controls_.end(), ctrl), advanced_controls_.end());
}

void AbstractControlSP::UpdateAllAdvancedControls() {
  bool visibility = Params().getBool("ShowAdvancedControls");
  advanced_controls_.erase(std::remove(advanced_controls_.begin(), advanced_controls_.end(), nullptr), advanced_controls_.end());
  for (auto *ctrl : advanced_controls_) ctrl->setVisible(visibility);
}

AbstractControlSP::AbstractControlSP(const QString &title, const QString &desc, const QString &icon, QWidget *parent, bool advancedControl)
    : AbstractControl(title, desc, icon, parent), isAdvancedControl(advancedControl) {
  if (isAdvancedControl) RegisterAdvancedControl(this);

  main_layout = new QVBoxLayout(this);
  main_layout->setMargin(0);

  hlayout = new QHBoxLayout;
  hlayout->setMargin(0);
  hlayout->setSpacing(20);

  // title
  title_label = new QPushButton(title);
  title_label->setFixedHeight(120);
  title_label->setStyleSheet("font-size: 50px; font-weight: 450; text-align: left; border: none;");
  hlayout->addWidget(title_label, 1);

  // value next to control button
  value = new ElidedLabelSP();
  value->setAlignment(Qt::AlignRight | Qt::AlignVCenter);
  value->setStyleSheet("color: #aaaaaa");
  hlayout->addWidget(value);

  main_layout->addLayout(hlayout);

  // description
  description = new QLabel(desc);
  description->setContentsMargins(40, 20, 40, 20);
  description->setStyleSheet("font-size: 40px; color: grey");
  description->setWordWrap(true);
  description->setVisible(false);
  main_layout->addWidget(description);

  connect(title_label, &QPushButton::clicked, [=]() {
    if (!description->isVisible()) {
      emit showDescriptionEvent();
    }

    if (!description->text().isEmpty()) {
      description->setVisible(!description->isVisible());
    }
  });

  main_layout->addStretch();
}

void AbstractControlSP::hideEvent(QHideEvent *e) {
  if (description != nullptr) {
    description->hide();
  }
}

AbstractControlSP_SELECTOR::AbstractControlSP_SELECTOR(const QString &title, const QString &desc, const QString &icon, QWidget *parent, bool advancedControl)
    : AbstractControlSP(title, desc, icon, parent, advancedControl) {

  if (title_label != nullptr) {
    delete title_label;
    title_label = nullptr;
  }

  if (description != nullptr) {
    delete description;
    description = nullptr;
  }

  if (value != nullptr) {
    ReplaceWidget(value, new QWidget());
    value = nullptr;
  }

  QLayoutItem *item;
  while ((item = main_layout->takeAt(0)) != nullptr) {
    if (item->widget()) {
      delete item->widget();
    }
    delete item;
  }

  main_layout->setMargin(0);

  hlayout = new QHBoxLayout;
  hlayout->setMargin(0);
  hlayout->setSpacing(0);

  // title
  if (!title.isEmpty()) {
    title_label = new QPushButton(title);
    title_label->setFixedHeight(120);
    title_label->setStyleSheet("font-size: 50px; font-weight: 450; text-align: left; border: none; padding: 0 0 0 0");
    main_layout->addWidget(title_label, 1);

    connect(title_label, &QPushButton::clicked, [=]() {
      if (!description->isVisible()) {
        emit showDescriptionEvent();
      }

      if (!description->text().isEmpty()) {
        bool isVisible = !description->isVisible();
        description->setVisible(isVisible);

        if (isVisible && spacingItem) {
          main_layout->removeItem(spacingItem);
        } else if (!isVisible && spacingItem != nullptr && main_layout->indexOf(spacingItem) == -1) {
          main_layout->insertItem(main_layout->indexOf(description), spacingItem);
        }
      }
    });
  } else {
    main_layout->addSpacing(20);
  }

  main_layout->addLayout(hlayout);
  if (!desc.isEmpty() && spacingItem != nullptr && main_layout->indexOf(spacingItem) == -1) {
    main_layout->insertItem(main_layout->count(), spacingItem);
  }

  // description
  description = new QLabel(desc);
  description->setContentsMargins(40, 20, 40, 20);
  description->setStyleSheet("font-size: 40px; color: grey");
  description->setWordWrap(true);
  description->setVisible(false);
  main_layout->addWidget(description);

  main_layout->addStretch();
}

void AbstractControlSP_SELECTOR::hideEvent(QHideEvent *e) {
  if (description != nullptr) {
    description->hide();
  }

  if (spacingItem != nullptr && main_layout->indexOf(spacingItem) == -1) {
    main_layout->insertItem(main_layout->indexOf(description), spacingItem);
  }
}

// controls

ButtonControlSP::ButtonControlSP(const QString &title, const QString &text, const QString &desc, QWidget *parent, bool advancedControl)
    : AbstractControlSP(title, desc, "", parent, advancedControl) {

  btn.setText(text);
  btn.setStyleSheet(R"(
    QPushButton {
      padding: 0;
      border-radius: 50px;
      font-size: 35px;
      font-weight: 500;
      color: #E4E4E4;
      background-color: #393939;
    }
    QPushButton:pressed {
      background-color: #4a4a4a;
    }
    QPushButton:disabled {
      color: #33E4E4E4;
    }
  )");
  btn.setFixedSize(250, 100);
  QObject::connect(&btn, &QPushButton::clicked, this, &ButtonControlSP::clicked);
  hlayout->addWidget(&btn);
}

// ElidedLabelSP

ElidedLabelSP::ElidedLabelSP(QWidget *parent) : ElidedLabelSP({}, parent) {
}

ElidedLabelSP::ElidedLabelSP(const QString &text, QWidget *parent) : QLabel(text.trimmed(), parent) {
  setSizePolicy(QSizePolicy::Preferred, QSizePolicy::Preferred);
  setMinimumWidth(1);
}

void ElidedLabelSP::resizeEvent(QResizeEvent *event) {
  QLabel::resizeEvent(event);
  lastText_ = elidedText_ = "";
}

void ElidedLabelSP::paintEvent(QPaintEvent *event) {
  const QString curText = text();
  if (curText != lastText_) {
    elidedText_ = fontMetrics().elidedText(curText, Qt::ElideRight, contentsRect().width());
    lastText_ = curText;
  }

  QPainter painter(this);
  drawFrame(&painter);
  QStyleOption opt;
  opt.initFrom(this);
  style()->drawItemText(&painter, contentsRect(), alignment(), opt.palette, isEnabled(), elidedText_, foregroundRole());
}

// ParamControlSP

ParamControlSP::ParamControlSP(const QString &param, const QString &title, const QString &desc, const QString &icon, QWidget *parent, bool advancedControl)
    : ToggleControlSP(title, desc, icon, false, parent, advancedControl){

  key = param.toStdString();
  QObject::connect(this, &ParamControlSP::toggleFlipped, this, &ParamControlSP::toggleClicked);

  hlayout->removeWidget(&toggle);
  hlayout->insertWidget(0, &toggle);

  hlayout->removeWidget(this->icon_label);
  hlayout->insertWidget(1, this->icon_label);
}

void ParamControlSP::toggleClicked(bool state) {
  auto do_confirm = [this]() {
    QString content("<body><h2 style=\"text-align: center;\">" + title_label->text() + "</h2><br>"
                    "<p style=\"text-align: center; margin: 0 128px; font-size: 50px;\">" + getDescription() + "</p></body>");
    return ConfirmationDialog(content, tr("Enable"), tr("Cancel"), true, this).exec();
  };

  bool confirmed = store_confirm && params.getBool(key + "Confirmed");
  if (!confirm || confirmed || !state || do_confirm()) {
    if (store_confirm && state) params.putBool(key + "Confirmed", true);
    params.putBool(key, state);
    setIcon(state);
  } else {
    toggle.togglePosition();
  }
}

// 在controls.cc文件末尾添加实现
MetricsConfigControlSP::MetricsConfigControlSP(const QString &param, const QString &title, const QString &desc,
                                              const std::vector<QString> &available_metrics, QWidget *parent)
    : AbstractControlSP(title, desc, "", parent), key(param.toStdString()), metrics_list(available_metrics) {

  // 创建复选框容器，独立于标题区域
  QWidget *checkbox_container = new QWidget;
  checkbox_container->setStyleSheet("background-color: #393939; border-radius: 20px; padding: 20px; margin-top: 10px;");

  // 使用网格布局，每行显示4个复选框
  QGridLayout *grid_layout = new QGridLayout(checkbox_container);
  grid_layout->setSpacing(20);
  grid_layout->setHorizontalSpacing(25);

  const int columns = 4;
  int row = 0;
  int col = 0;

  // 定义多语言映射表
  QMap<QString, QString> metric_translations = {
    {"TEMP", tr("TEMP")},
    {"CPU", tr("CPU")},
    {"GPU", tr("GPU")},
    {"MEMORY", tr("MEMORY")},
    {"STORAGE", tr("STORAGE")},
    {"PANDA", tr("PANDA")},
    {"CONNECT", tr("CONNECT")},
    {"SUNNYLINK", tr("SUNNYLINK")}
  };

  // 为每个metric创建checkbox，使用翻译后的名称
  for (const QString &metric : metrics_list) {
    QString display_name = metric_translations.value(metric, metric); // 如果没有翻译则使用原名

    QCheckBox *checkbox = new QCheckBox(display_name);
    checkbox->setStyleSheet(R"(
      QCheckBox {
        font-size: 32px;
        font-weight: 450;
        color: #FFFFFF;
        spacing: 12px;
        min-width: 140px;
        padding: 8px;
      }
      QCheckBox::indicator {
        width: 35px;
        height: 35px;
        border-radius: 8px;
        border: 2px solid #FFFFFF;
        background-color: transparent;
      }
      QCheckBox::indicator:checked {
        background-color: #1e79e8;
        border-color: #1e79e8;
      }
      QCheckBox::indicator:checked:pressed {
        background-color: #1E8FFF;
      }
    )");

    checkboxes.push_back(checkbox);
    grid_layout->addWidget(checkbox, row, col);

    connect(checkbox, &QCheckBox::toggled, this, &MetricsConfigControlSP::onCheckboxChanged);

    col++;
    if (col >= columns) {
      col = 0;
      row++;
    }
  }

  // 添加说明文字，使用tr()函数
  QLabel *hint = new QLabel(tr("Select up to %1 metrics to display").arg(MAX_METRICS));
  hint->setStyleSheet("font-size: 26px; color: #CCCCCC; margin-top: 15px;");
  hint->setAlignment(Qt::AlignCenter);
  grid_layout->addWidget(hint, row + 1, 0, 1, columns);

  // 创建垂直布局，将复选框容器放在主布局下方
  QVBoxLayout *container_layout = new QVBoxLayout;
  container_layout->setMargin(0);
  container_layout->setSpacing(0);
  container_layout->addWidget(checkbox_container);

  // 将整个容器添加到主布局
  main_layout->addLayout(container_layout);

  loadCurrentConfig();
}

void MetricsConfigControlSP::loadCurrentConfig() {
  std::string config = params.get(key);

  // 清除所有选择
  for (auto checkbox : checkboxes) {
    checkbox->setChecked(false);
  }

  if (!config.empty()) {
    std::stringstream ss(config);
    std::string item;
    while (std::getline(ss, item, ',')) {
      QString qitem = QString::fromStdString(item).trimmed();

      for (int i = 0; i < metrics_list.size(); i++) {
        if (metrics_list[i] == qitem && i < checkboxes.size()) {
          checkboxes[i]->setChecked(true);
          break;
        }
      }
    }
  }
}

void MetricsConfigControlSP::onCheckboxChanged() {
  // 检查选中的数量
  int checked_count = 0;
  for (auto checkbox : checkboxes) {
    if (checkbox->isChecked()) {
      checked_count++;
    }
  }

  // 如果超过最大数量，禁用未选中的checkbox
  bool enable_unchecked = checked_count < MAX_METRICS;
  for (auto checkbox : checkboxes) {
    if (!checkbox->isChecked()) {
      checkbox->setEnabled(enable_unchecked);
    }
  }

  updateParamValue();
}

void MetricsConfigControlSP::updateParamValue() {
  QStringList selected_metrics;

  for (int i = 0; i < checkboxes.size(); i++) {
    if (checkboxes[i]->isChecked()) {
      selected_metrics.push_back(metrics_list[i]);
    }
  }

  // 构建逗号分隔的字符串
  QString config_str = selected_metrics.join(",");
  params.put(key, config_str.toStdString());
}

void MetricsConfigControlSP::refresh() {
  loadCurrentConfig();
}

void MetricsConfigControlSP::showEvent(QShowEvent *event) {
  QWidget::showEvent(event);
  refresh();
}
