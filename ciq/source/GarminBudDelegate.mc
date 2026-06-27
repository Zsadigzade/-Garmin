import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class GarminBudDelegate extends WatchUi.BehaviorDelegate {

    function initialize() {
        BehaviorDelegate.initialize();
    }

    private function handleNavigation() as Void {
        var app = Application.getApp() as GarminBudApp;
        var status = app.getStatus();

        if (status.equals("ready") || status.equals("stale")) {
            app.nextCard();
            WatchUi.requestUpdate();
        } else if (status.equals("error") || status.equals("config")) {
            app.fetchSummary();
        }
    }

    private function handlePreviousCard() as Void {
        var app = Application.getApp() as GarminBudApp;
        var status = app.getStatus();

        if (status.equals("ready") || status.equals("stale")) {
            app.prevCard();
            WatchUi.requestUpdate();
        } else if (status.equals("error") || status.equals("config")) {
            app.fetchSummary();
        }
    }

    function onTap(clickEvent as WatchUi.ClickEvent) as Boolean {
        handleNavigation();
        return true;
    }

    function onSelect() as Boolean {
        handleNavigation();
        return true;
    }

    function onSwipe(swipeEvent as WatchUi.SwipeEvent) as Boolean {
        var direction = swipeEvent.getDirection();

        if (direction == WatchUi.SWIPE_LEFT) {
            handleNavigation();
        } else if (direction == WatchUi.SWIPE_RIGHT) {
            handlePreviousCard();
        }

        return true;
    }
}
