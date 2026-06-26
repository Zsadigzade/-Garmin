import Toybox.Application;
import Toybox.Graphics;
import Toybox.Lang;
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

        drawCard(dc, app.getCardIndex(), app.getSummary());
        drawHint(dc);
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

    private function drawCard(dc as Dc, cardIndex as Number, summary as Dictionary or Null) as Void {
        var title = getCardTitle(cardIndex);
        var value = WatchUi.loadResource(Rez.Strings.NoData);
        var subtitle = "";

        if (summary != null) {
            var cardData = getCardData(cardIndex, summary);
            value = cardData[:value];
            subtitle = cardData[:subtitle];
        }

        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            dc.getWidth() / 2,
            28,
            Graphics.FONT_SMALL,
            title,
            Graphics.TEXT_JUSTIFY_CENTER
        );

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

    private function getCardTitle(cardIndex as Number) as String {
        if (cardIndex == 0) {
            return WatchUi.loadResource(Rez.Strings.CardRecovery);
        }
        if (cardIndex == 1) {
            return WatchUi.loadResource(Rez.Strings.CardSleep);
        }
        if (cardIndex == 2) {
            return WatchUi.loadResource(Rez.Strings.CardActivity);
        }
        if (cardIndex == 3) {
            return WatchUi.loadResource(Rez.Strings.CardStress);
        }
        return WatchUi.loadResource(Rez.Strings.CardVo2Max);
    }

    private function getCardData(cardIndex as Number, summary as Dictionary) as Dictionary {
        var result = {
            :value => WatchUi.loadResource(Rez.Strings.NoData),
            :subtitle => ""
        };

        if (cardIndex == 0) {
            var recovery = summary.get("recovery");
            if (recovery != null && recovery instanceof Dictionary) {
                var recoveryDict = recovery as Dictionary;
                var score = recoveryDict.get("score");
                var label = recoveryDict.get("label");
                if (score != null) {
                    result[:value] = score.toString();
                }
                if (label != null) {
                    result[:subtitle] = label as String;
                }
            }
            return result;
        }

        if (cardIndex == 1) {
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
                } else if (label != null) {
                    result[:subtitle] = label as String;
                }
            }
            return result;
        }

        if (cardIndex == 2) {
            var activity = summary.get("activity");
            if (activity != null && activity instanceof Dictionary) {
                var activityDict = activity as Dictionary;
                var name = activityDict.get("name");
                var distance = activityDict.get("distance_km");
                if (name != null) {
                    result[:value] = truncate(name as String, 14);
                }
                if (distance != null) {
                    result[:subtitle] = distance.toString() + " km";
                }
            }
            return result;
        }

        if (cardIndex == 3) {
            var stress = summary.get("stress");
            if (stress != null && stress instanceof Dictionary) {
                var stressDict = stress as Dictionary;
                var avg = stressDict.get("avg");
                var label = stressDict.get("label");
                if (avg != null) {
                    result[:value] = avg.toString();
                }
                if (label != null) {
                    result[:subtitle] = label as String;
                }
            }
            return result;
        }

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

    private function truncate(text as String, maxLen as Number) as String {
        if (text.length() <= maxLen) {
            return text;
        }
        return text.substring(0, maxLen - 3) + "...";
    }
}
