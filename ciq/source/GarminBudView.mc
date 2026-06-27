import Toybox.Application;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Time;
import Toybox.WatchUi;

class GarminBudView extends WatchUi.View {

    function initialize() {
        View.initialize();
    }

    function onShow() as Void {
        var app = Application.getApp() as GarminBudApp;
        app.fetchSummary();
    }

    function onUpdate(dc as Dc) as Void {
        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();

        var app = Application.getApp() as GarminBudApp;
        var status = app.getStatus();

        if (status.equals("config")) {
            drawMessage(dc, WatchUi.loadResource(Rez.Strings.ConfigError));
            return;
        }

        if (status.equals("loading")) {
            drawMessage(dc, WatchUi.loadResource(Rez.Strings.Loading));
            return;
        }

        if (status.equals("error")) {
            drawMessage(dc, WatchUi.loadResource(Rez.Strings.FetchError));
            return;
        }

        drawCard(dc, app.getCardIndex(), app.getSummary(), isRoundScreen(dc));

        if (status.equals("stale")) {
            drawStaleIndicator(dc, app.getCachedAt());
        }

        drawHint(dc);
    }

    private function isRoundScreen(dc as Dc) as Boolean {
        return dc.getWidth() == dc.getHeight() && dc.getWidth() >= 240;
    }

    private function drawMessage(dc as Dc, message as String) as Void {
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            dc.getWidth() / 2,
            dc.getHeight() / 2,
            Graphics.FONT_SMALL,
            message,
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER
        );
    }

    private function drawHint(dc as Dc) as Void {
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            dc.getWidth() / 2,
            dc.getHeight() - 4,
            Graphics.FONT_XTINY,
            WatchUi.loadResource(Rez.Strings.TapHint),
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER
        );
    }

    private function drawStaleIndicator(dc as Dc, cachedAt as Number or Null) as Void {
        if (cachedAt == null) {
            return;
        }

        var minutesAgo = ((Time.now().value() - cachedAt) / 60).toNumber();
        if (minutesAgo < 1) {
            minutesAgo = 1;
        }

        var staleText = WatchUi.loadResource(Rez.Strings.StalePrefix) + " " +
            minutesAgo.toString() + "m " +
            WatchUi.loadResource(Rez.Strings.StaleSuffix);

        dc.setColor(Graphics.COLOR_YELLOW, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            dc.getWidth() / 2,
            12,
            Graphics.FONT_XTINY,
            staleText,
            Graphics.TEXT_JUSTIFY_CENTER
        );
    }

    private function drawCard(
        dc as Dc,
        cardIndex as Number,
        summary as Dictionary or Null,
        roundScreen as Boolean
    ) as Void {
        if (cardIndex == 0) {
            drawOverviewCard(dc, summary);
            return;
        }

        if (cardIndex == 1) {
            drawRecoveryCard(dc, summary, roundScreen);
            return;
        }

        var title = getCardTitle(cardIndex);
        var value = WatchUi.loadResource(Rez.Strings.NoData);
        var subtitle = "";
        var valueColor = Graphics.COLOR_WHITE;

        if (summary != null) {
            var cardData = getCardData(cardIndex, summary);
            value = cardData[:value];
            subtitle = cardData[:subtitle];
            valueColor = cardData[:color];
        }

        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            dc.getWidth() / 2,
            28,
            Graphics.FONT_SMALL,
            title,
            Graphics.TEXT_JUSTIFY_CENTER
        );

        dc.setColor(valueColor, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            dc.getWidth() / 2,
            dc.getHeight() / 2 - 8,
            Graphics.FONT_NUMBER_HOT,
            value,
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER
        );

        if (subtitle.length() > 0) {
            dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(
                dc.getWidth() / 2,
                dc.getHeight() / 2 + 36,
                Graphics.FONT_TINY,
                subtitle,
                Graphics.TEXT_JUSTIFY_CENTER
            );
        }
    }

    private function drawOverviewCard(dc as Dc, summary as Dictionary or Null) as Void {
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            dc.getWidth() / 2,
            24,
            Graphics.FONT_SMALL,
            WatchUi.loadResource(Rez.Strings.CardOverview),
            Graphics.TEXT_JUSTIFY_CENTER
        );

        var recValue = WatchUi.loadResource(Rez.Strings.NoData);
        var sleepValue = WatchUi.loadResource(Rez.Strings.NoData);
        var stressValue = WatchUi.loadResource(Rez.Strings.NoData);
        var vo2Value = WatchUi.loadResource(Rez.Strings.NoData);

        if (summary != null) {
            var overview = summary.get("daily_overview");
            if (overview != null && overview instanceof Dictionary) {
                var overviewDict = overview as Dictionary;

                var recovery = overviewDict.get("recovery");
                if (recovery != null) {
                    recValue = recovery.toString();
                }

                var sleepH = overviewDict.get("sleep_h");
                if (sleepH != null) {
                    sleepValue = sleepH.toString() + "h";
                }

                var stress = overviewDict.get("stress");
                if (stress != null) {
                    stressValue = stress.toString();
                }

                var vo2 = overviewDict.get("vo2max");
                if (vo2 != null) {
                    vo2Value = vo2.toString();
                }
            }
        }

        var leftX = dc.getWidth() / 4;
        var rightX = (dc.getWidth() * 3) / 4;
        var topY = dc.getHeight() / 2 - 24;
        var bottomY = dc.getHeight() / 2 + 18;

        drawOverviewCell(
            dc,
            leftX,
            topY,
            WatchUi.loadResource(Rez.Strings.LabelRecovery),
            recValue,
            recoveryColor(parseNumber(recValue))
        );
        drawOverviewCell(
            dc,
            rightX,
            topY,
            WatchUi.loadResource(Rez.Strings.LabelSleep),
            sleepValue,
            sleepColor(null)
        );
        drawOverviewCell(
            dc,
            leftX,
            bottomY,
            WatchUi.loadResource(Rez.Strings.LabelStress),
            stressValue,
            stressColor(parseNumber(stressValue))
        );
        drawOverviewCell(
            dc,
            rightX,
            bottomY,
            WatchUi.loadResource(Rez.Strings.LabelVo2),
            vo2Value,
            Graphics.COLOR_WHITE
        );
    }

    private function drawOverviewCell(
        dc as Dc,
        x as Number,
        y as Number,
        label as String,
        value as String,
        valueColor as Number
    ) as Void {
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(x, y, Graphics.FONT_XTINY, label, Graphics.TEXT_JUSTIFY_CENTER);

        dc.setColor(valueColor, Graphics.COLOR_TRANSPARENT);
        dc.drawText(x, y + 18, Graphics.FONT_MEDIUM, value, Graphics.TEXT_JUSTIFY_CENTER);
    }

    private function drawRecoveryCard(
        dc as Dc,
        summary as Dictionary or Null,
        roundScreen as Boolean
    ) as Void {
        var score = 0;
        var label = WatchUi.loadResource(Rez.Strings.NoData);
        var hasScore = false;

        if (summary != null) {
            var recovery = summary.get("recovery");
            if (recovery != null && recovery instanceof Dictionary) {
                var recoveryDict = recovery as Dictionary;
                var scoreValue = recoveryDict.get("score");
                var labelValue = recoveryDict.get("label");
                if (scoreValue != null) {
                    score = scoreValue as Number;
                    hasScore = true;
                }
                if (labelValue != null) {
                    label = labelValue as String;
                }
            }
        }

        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            dc.getWidth() / 2,
            24,
            Graphics.FONT_SMALL,
            WatchUi.loadResource(Rez.Strings.CardRecovery),
            Graphics.TEXT_JUSTIFY_CENTER
        );

        var color = recoveryColor(hasScore ? score : null);
        var cx = dc.getWidth() / 2;
        var cy = dc.getHeight() / 2;

        if (roundScreen && hasScore) {
            var radius = (dc.getWidth() / 2) - 36;
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawArc(cx, cy, radius, Graphics.ARC_COUNTER_CLOCKWISE, 90, 90 - 360);

            var endAngle = 90 - ((score * 360) / 100);
            dc.setColor(color, Graphics.COLOR_TRANSPARENT);
            dc.drawArc(cx, cy, radius, Graphics.ARC_COUNTER_CLOCKWISE, 90, endAngle);
        } else if (hasScore) {
            var barWidth = dc.getWidth() - 40;
            var fillWidth = (barWidth * score) / 100;
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.fillRectangle(20, cy + 8, barWidth, 8);
            dc.setColor(color, Graphics.COLOR_TRANSPARENT);
            dc.fillRectangle(20, cy + 8, fillWidth, 8);
        }

        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            cx,
            cy - 8,
            Graphics.FONT_NUMBER_HOT,
            hasScore ? score.toString() : WatchUi.loadResource(Rez.Strings.NoData),
            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER
        );

        if (label.length() > 0) {
            dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(
                cx,
                cy + 36,
                Graphics.FONT_TINY,
                label,
                Graphics.TEXT_JUSTIFY_CENTER
            );
        }
    }

    private function getCardTitle(cardIndex as Number) as String {
        if (cardIndex == 2) {
            return WatchUi.loadResource(Rez.Strings.CardSleep);
        }
        if (cardIndex == 3) {
            return WatchUi.loadResource(Rez.Strings.CardActivity);
        }
        if (cardIndex == 4) {
            return WatchUi.loadResource(Rez.Strings.CardStress);
        }
        if (cardIndex == 5) {
            return WatchUi.loadResource(Rez.Strings.CardVo2Max);
        }
        return WatchUi.loadResource(Rez.Strings.CardHeartRate);
    }

    private function getCardData(cardIndex as Number, summary as Dictionary) as Dictionary {
        var result = {
            :value => WatchUi.loadResource(Rez.Strings.NoData),
            :subtitle => "",
            :color => Graphics.COLOR_WHITE
        };

        if (cardIndex == 2) {
            var sleep = summary.get("sleep");
            if (sleep != null && sleep instanceof Dictionary) {
                var sleepDict = sleep as Dictionary;
                var hours = sleepDict.get("hours");
                var score = sleepDict.get("score");
                var label = sleepDict.get("label");
                if (hours != null) {
                    result[:value] = hours.toString() + "h";
                }
                if (score != null) {
                    result[:subtitle] = "Score " + score.toString();
                    result[:color] = sleepColor(score as Number);
                } else if (label != null) {
                    result[:subtitle] = label as String;
                }
            }
            return result;
        }

        if (cardIndex == 3) {
            var activity = summary.get("activity");
            if (activity != null && activity instanceof Dictionary) {
                var activityDict = activity as Dictionary;
                var name = activityDict.get("name");
                var distance = activityDict.get("distance_km");
                var durationMin = activityDict.get("duration_min");
                var avgHr = activityDict.get("avg_hr");
                var subtitleParts = [] as Array<String>;

                if (name != null) {
                    result[:value] = truncate(name as String, 14);
                }
                if (durationMin != null) {
                    subtitleParts.add(formatDuration(durationMin as Number));
                }
                if (distance != null) {
                    subtitleParts.add(distance.toString() + " km");
                }
                if (avgHr != null) {
                    subtitleParts.add(avgHr.toString() + " bpm");
                }
                result[:subtitle] = joinParts(subtitleParts, " · ");
            }
            return result;
        }

        if (cardIndex == 4) {
            var stress = summary.get("stress");
            if (stress != null && stress instanceof Dictionary) {
                var stressDict = stress as Dictionary;
                var avg = stressDict.get("avg");
                var label = stressDict.get("label");
                if (avg != null) {
                    result[:value] = avg.toString();
                    result[:color] = stressColor(avg as Number);
                }
                if (label != null) {
                    result[:subtitle] = label as String;
                }
            }
            return result;
        }

        if (cardIndex == 5) {
            var vo2max = summary.get("vo2max");
            if (vo2max != null && vo2max instanceof Dictionary) {
                var vo2Dict = vo2max as Dictionary;
                var value = vo2Dict.get("value");
                var trend = vo2Dict.get("trend");
                if (value != null) {
                    result[:value] = value.toString();
                }
                if (trend != null) {
                    result[:subtitle] = trend as String;
                }
            }
            return result;
        }

        var heartRate = summary.get("heart_rate");
        if (heartRate != null && heartRate instanceof Dictionary) {
            var hrDict = heartRate as Dictionary;
            var resting = hrDict.get("resting");
            var max = hrDict.get("max");
            if (resting != null) {
                result[:value] = resting.toString();
                result[:color] = heartRateColor(resting as Number);
            }
            if (max != null) {
                result[:subtitle] = WatchUi.loadResource(Rez.Strings.LabelMax) + " " + max.toString();
            } else {
                result[:subtitle] = WatchUi.loadResource(Rez.Strings.LabelResting);
            }
        }

        return result;
    }

    private function recoveryColor(score as Number or Null) as Number {
        if (score == null) {
            return Graphics.COLOR_WHITE;
        }
        if (score >= 70) {
            return Graphics.COLOR_GREEN;
        }
        if (score >= 50) {
            return Graphics.COLOR_YELLOW;
        }
        return Graphics.COLOR_RED;
    }

    private function sleepColor(score as Number or Null) as Number {
        if (score == null) {
            return Graphics.COLOR_WHITE;
        }
        if (score >= 80) {
            return Graphics.COLOR_GREEN;
        }
        if (score >= 60) {
            return Graphics.COLOR_YELLOW;
        }
        return Graphics.COLOR_RED;
    }

    private function stressColor(avg as Number or Null) as Number {
        if (avg == null) {
            return Graphics.COLOR_WHITE;
        }
        if (avg <= 25) {
            return Graphics.COLOR_GREEN;
        }
        if (avg <= 50) {
            return Graphics.COLOR_YELLOW;
        }
        return Graphics.COLOR_RED;
    }

    private function heartRateColor(resting as Number) as Number {
        if (resting < 60) {
            return Graphics.COLOR_GREEN;
        }
        if (resting <= 80) {
            return Graphics.COLOR_YELLOW;
        }
        return Graphics.COLOR_RED;
    }

    private function parseNumber(text as String) as Number or Null {
        if (text.equals(WatchUi.loadResource(Rez.Strings.NoData))) {
            return null;
        }

        var digits = "";
        for (var i = 0; i < text.length(); i += 1) {
            var ch = text.substring(i, i + 1);
            if (ch.equals("0") || ch.equals("1") || ch.equals("2") || ch.equals("3") ||
                ch.equals("4") || ch.equals("5") || ch.equals("6") || ch.equals("7") ||
                ch.equals("8") || ch.equals("9")) {
                digits += ch;
            } else {
                break;
            }
        }

        if (digits.length() == 0) {
            return null;
        }

        return digits.toNumber();
    }

    private function formatDuration(minutes as Number) as String {
        if (minutes >= 60) {
            var hours = minutes / 60;
            var mins = minutes % 60;
            return hours.toNumber().toString() + "h " + mins.toString() + "m";
        }

        return minutes.toString() + "m";
    }

    private function joinParts(parts as Array<String>, separator as String) as String {
        var result = "";
        for (var i = 0; i < parts.size(); i += 1) {
            if (i > 0) {
                result += separator;
            }
            result += parts[i];
        }
        return result;
    }

    private function truncate(text as String, maxLen as Number) as String {
        if (text.length() <= maxLen) {
            return text;
        }
        return text.substring(0, maxLen - 3) + "...";
    }
}
