#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from scanner.scanner.collector import start_stream as api_stream
from scanner.scanner.db_collector import start_stream as db_stream
from scanner.scanner.collector import PolygonManager

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backtestingApp.settings')
    # p_manager = PolygonManager(5)
    # p_manager.start()
    # db_stream()
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
