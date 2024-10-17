import flet as ft
from flet import *
from datetime import datetime
import asyncio


def main(page: Page):
    page.title = "Контроль рабочего дня Bitrix24"
    page.padding = 100
    page.vertical_alignment = ft.MainAxisAlignment.START
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.window.width = 470
    page.window.height = 610
    page.theme_mode = ft.ThemeMode.SYSTEM
    page.scroll = ft.ScrollMode.ALWAYS

    def save_changes(e):
        page.client_storage.set("start_time", str(start_day_time_field.value))
        page.client_storage.set("end_time", str(end_day_time_field.value))
        page.client_storage.set("end_time_friday", str(end_friday_time_field.value))
        page.client_storage.set("check_delay", int(check_delay_field.value))
        page.client_storage.set("short_friday", is_friday_short.value)
        page.client_storage.set("reason", default_reason_end_day.value)
        page.client_storage.set("link_api", link_api_field.value)

        page.go("/")

    def route_change(e):
        page.views.clear()
        page.views.append(
            main_view
        )
        if page.route == "/settings":
            page.views.append(
                settings_view
            )
        page.update()

    def validate_input(e):
        if not e.control.value.isdigit():
            e.control.value = e.control.value[:-1]
            page.update()

    def set_start_day_time(e):
        start_day_time_field.value = start_day_time_picker.value
        page.update()
    
    def set_end_day_time(e):
        end_day_time_field.value = end_day_time_picker.value
        page.update()

    def set_end_friday_end_time(e):
        end_friday_time_field.value = end_friday_time_picker.value
        page.update()

    status = ""

    reason = page.client_storage.get("reason") or "Не было возможности остановить рабочий день из-за недоступности корпоративного портала битрикс"
    start_time = datetime.strptime(page.client_storage.get("start_time"), '%H:%M:%S').time() or "00:00:00"
    end_time = datetime.strptime(page.client_storage.get("end_time"), '%H:%M:%S').time() or "00:00:00"
    end_time_friday = datetime.strptime(page.client_storage.get("end_time_friday"), '%H:%M:%S').time() or "00:00:00"
    check_delay = page.client_storage.get("check_delay") or 0
    short_friday = page.client_storage.get("short_friday") or False
    link_api = page.client_storage.get("link_api")

    current_time = ft.Text(size=22)
    check_delay_field = TextField(label = "Частота проверки статуса(в минутах)", on_change=validate_input, value=check_delay)
    start_day_time_field = TextField(label = "Время начала рабочего дня", read_only = True, value=start_time)
    start_day_time_button = ElevatedButton(text="Изменить", on_click = lambda _: page.open(start_day_time_picker))
    end_day_time_field = TextField(label = "Время окончания рабочего дня", read_only = True, value=end_time)
    end_day_time_button = ElevatedButton(text = "Изменить", on_click = lambda _: page.open(end_day_time_picker))
    end_friday_time_field = TextField(label = "Время окончания рабочего дня в пятницу", read_only = True, value=end_time_friday)
    end_friday_time_button = ElevatedButton(text = "Изменить", on_click = lambda _: page.open(end_friday_time_picker))
    is_friday_short = Checkbox(label = "Пятница сокращенный день?", value = short_friday)
    link_api_field = TextField(label="Ссылка API битрикс", value=link_api)
    default_reason_end_day = TextField(label = "Стандартная причина незавершения рабочего дня", multiline = True, value=reason)
    status_text = Text(weight=ft.FontWeight.BOLD, italic = True, size = 18)
    dont_start = Checkbox(label = "Не начинать рабочий день", value = False)
    dont_stop = Checkbox(label = "Не завершать рабочий день", value = False)
    start_day_time_picker = TimePicker(
        confirm_text="Применить",
        error_invalid_text="Неверное время",
        help_text="Выберите время начала рабочего дня",
        cancel_text="Отмена",
        hour_label_text="Часов",
        minute_label_text="Минут",
        on_change = set_start_day_time)

    end_day_time_picker = TimePicker(
        confirm_text="Применить",
        error_invalid_text="Неверное время",
        help_text="Выберите время начала рабочего дня",
        cancel_text="Отмена",
        hour_label_text="Часов",
        minute_label_text="Минут",
        on_change = set_end_day_time)
   
    end_friday_time_picker = TimePicker(
        confirm_text="Применить",
        error_invalid_text="Неверное время",
        help_text="Выберите время начала рабочего дня",
        cancel_text="Отмена",
        hour_label_text="Часов",
        minute_label_text="Минут",
        on_change = set_end_friday_end_time)
    

    main_view = View(
                "/",
                [
                    AppBar(title = current_time, bgcolor=colors.SURFACE_VARIANT, actions=[
                        IconButton(icon=ft.icons.SETTINGS, on_click=lambda _: page.go("/settings")),
                    ]),
                    Row(controls=[
                                Text("Текущий статус рабочего дня: ", size = 18),
                                status_text
                    ]),
                    Row(controls=[
                        ElevatedButton(text="Начать рабочий день", bgcolor=ft.colors.GREEN_700, color=ft.colors.WHITE),
                        ElevatedButton(text="Завершить рабочий день", bgcolor=ft.colors.RED_700, color=ft.colors.WHITE)
                    ], alignment="center",
                    spacing=20),
                    ElevatedButton(text="Поставить на паузу или продолжить рабочий день", bgcolor=ft.colors.YELLOW_900, color=ft.colors.WHITE, width=400),
                    Row(controls = [dont_start], alignment="center"),
                    Row(controls = [dont_stop], alignment="center"),
                ],
                horizontal_alignment="center"
            )
    
    settings_view = View(
                    "/settings",
                    [
                        AppBar(title=Text("Настройки"), bgcolor=colors.SURFACE_VARIANT),
                        check_delay_field,
                        Row(controls = [
                            start_day_time_field,
                            start_day_time_button
                        ]),
                        Row(controls = [
                            end_day_time_field,
                            end_day_time_button
                        ]),
                        is_friday_short,
                        Row(controls = [
                            end_friday_time_field,
                            end_friday_time_button
                        ]),
                        link_api_field,
                        default_reason_end_day,
                        ElevatedButton("Сохранить", on_click=save_changes),
                    ],
                    horizontal_alignment="center",
                )
    
    def view_pop(e):
        page.views.pop()
        top_view = page.views[-1]
        page.go(top_view.route)

    async def update_clock():
        while True:
            now = datetime.now()
            time_str = now.strftime(" %d.%m.%Y %H:%M:%S")
            day_of_week = now.weekday()
            days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
            current_day = days[day_of_week]
            current_time.value = current_day + time_str
            if status == "OPENED":
                status_text.value = "Начат"
                status_text.color = ft.colors.GREEN_500
            elif status == "STOPED":
                status_text.value = "Остановлен"
                status_text.color = ft.colors.RED_500
            elif status == "EXPIRED":
                status_text.value = "Не остановлен"
                status_text.color = ft.colors.DEEP_ORANGE_900
            page.update()
            await asyncio.sleep(1)

    async def check_status():
        while True:
            print("Выполняется дополнительное действие")
            await asyncio.sleep(check_delay*60)
    
    async def main_coroutine():
        await asyncio.gather(update_clock(), check_status())

    page.on_route_change = route_change
    page.on_view_pop = view_pop
    page.go(page.route)
    asyncio.run(main_coroutine())
    
ft.app(main)