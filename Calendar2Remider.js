// Create a new notification
let notification = new Notification();
notification.title = "Calendar2Reminder";
notification.sound = "default"; // You can set a custom sound if desired
let result = "No new event to sync";

// Fetch Calendar events
let now = new Date();
let oneWeekLater = new Date();
oneWeekLater.setDate(oneWeekLater.getDate() + 7);

let events = await CalendarEvent.between(now, oneWeekLater);

let existingReminders = await Reminder.allIncomplete();

// Copy events to Reminders
if (events && Array.isArray(events)) {
    for (const event of events) {
        if (event instanceof CalendarEvent) {
            let title = event.title || "No Title";
            let notes = event.notes || "void";
            let startDate = event.startDate;
            let endDate = event.endDate;
            console.log(title, startDate, endDate);

            // Check if the event is already present in Reminders
            let isPresent = existingReminders.some(reminder =>
                reminder.title === `[${event.calendar.title}] - ${title}` &&
                reminder.dueDate.getTime() === startDate.getTime()
            );
            console.log(isPresent);

            if (!isPresent) {
                let reminder = new Reminder();
                reminder.dueDateIncludesTime = true;
                reminder.title = `[${event.calendar.title}] - ${title}`;
                reminder.notes = notes;
                reminder.dueDate = startDate;

                try {
                    reminder.save();
                    result = "Reminder saved successfully.";
                    existingReminders.push(reminder);
                } catch (error) {
                    result = "Error saving Reminder:" + error;
                }
            }
        }
    }
} else {
    result = "Error fetching events or events data is invalid.";
}

notification.body = result;
notification.schedule(); // Schedule the notification to be shown immediately

Script.complete();

