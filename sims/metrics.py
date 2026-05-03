"""Метрики 'интересности' прохождения."""
from run_sim import SimResult


def event_gaps(result: SimResult) -> dict:
    """
    События = моменты когда игрок принимает решение (купил/продал/исследовал).
    Возвращает: max gap, средний gap, распределение по 5-минутным окнам.
    """
    times = [t for t, _ in result.decision_log]
    if len(times) < 2:
        return {"max_gap": result.time_to_win, "avg_gap": 0, "events_total": len(times)}

    gaps = [times[i+1] - times[i] for i in range(len(times) - 1)]
    # Распределение по 5-минутным окнам
    windows = {}
    for t in times:
        bucket = int(t // 300)  # 5 минут
        windows[bucket] = windows.get(bucket, 0) + 1

    return {
        "max_gap_sec": max(gaps),
        "avg_gap_sec": sum(gaps) / len(gaps),
        "events_total": len(times),
        "events_per_5min": windows,
    }


def progress_smoothness(result: SimResult) -> dict:
    """
    Гладкость прогресса: насколько равномерно растут XP/исследования.
    Возвращает: список 'когда было какое исследование' и оценку дисперсии.
    """
    research_log = []
    for t, action in result.decision_log:
        if action.startswith("research(") or "research(" in action:
            for part in action.split(","):
                if part.startswith("research("):
                    rid = int(part.replace("research(", "").replace(")", ""))
                    research_log.append((t, rid))

    if not research_log:
        return {"research_times": [], "spread_min": 0, "max_idle_min": 0}

    times = [t for t, _ in research_log]
    spread = max(times) - min(times) if len(times) > 1 else 0
    # Между последним research и победой
    idle_after_last = result.time_to_win - max(times) if times else 0

    return {
        "research_times": [(t / 60, rid) for t, rid in research_log],
        "spread_min": spread / 60,
        "idle_after_last_min": idle_after_last / 60,
    }


def report(name: str, result: SimResult) -> None:
    print(f"\n{'='*70}\n{name}\n{'='*70}")
    print(result.summary())
    if result.bottleneck:
        print(f"Боттлнек: {result.bottleneck}")

    g = event_gaps(result)
    print(f"\nСобытий всего: {g['events_total']}, "
          f"max gap: {g['max_gap_sec']:.0f}s, avg gap: {g['avg_gap_sec']:.1f}s")
    print("События по 5-мин окнам:", end=" ")
    if "events_per_5min" in g:
        for w in sorted(g["events_per_5min"]):
            print(f"[{w*5}-{(w+1)*5}min:{g['events_per_5min'][w]}]", end=" ")
        print()

    p = progress_smoothness(result)
    print(f"\nИсследования куплены за {p['spread_min']:.1f} мин, "
          f"после последнего ждали {p['idle_after_last_min']:.1f} мин")
    print("Тайминг исследований (мин : id):")
    for t, rid in p["research_times"]:
        print(f"  {t:5.1f}мин -> R{rid}")
