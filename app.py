#################### app.py ####################
import streamlit as st
import pathlib
import warnings

# 1) Import the ARIMA forecast page function from your new folder
from arima_forecast.forecast_page import run_arima_forecast

warnings.filterwarnings("ignore")


def show_html(filename, height=900, scrolling=True):
    """
    Loads an HTML file from templates/ and displays it in an iframe within Streamlit.
    Used for 'landing_page.html' in the 'templates/' folder.
    """
    try:
        html_path = pathlib.Path(f"templates/{filename}")
        if not html_path.exists():
            st.error(f"Could not find {filename} in templates/ folder.")
            return
        html_content = html_path.read_text(encoding="utf-8")
        st.components.v1.html(html_content, height=height, scrolling=scrolling)
    except Exception as e:
        st.error(f"Could not load {filename}: {e}")


def show_farm_game():
    """
    Reads the compiled Farmhand game index from game/static/index.html
    and embeds it as an iframe in Streamlit.
    """
    try:
        game_index = pathlib.Path("game/static/index.html")
        if not game_index.exists():
            st.error(
                "Farm Game not found! "
                "Ensure the final build files are copied to 'game/static/'."
            )
            return
        html_str = game_index.read_text(encoding="utf-8")
        st.components.v1.html(html_str, height=800, scrolling=True)
    except Exception as e:
        st.error(f"Could not load the Farmhand game: {e}")


def main():
    """
    Main entry point for the Streamlit app.
    Creates three top tabs: Home, Pollutant Forecast, Farm Game.
    """
    st.set_page_config(page_title="My Water Theme Demo", layout="wide")

    # Create tabbed layout at the top
    tabs = st.tabs(["Home", "Pollutant Forecast", "Farm Game"])

    # --- Tab 1: Home (Landing Page)
    with tabs[0]:
        show_html("landing_page.html", height=900)

    # --- Tab 2: Pollutant Forecast (ARIMA)
    with tabs[1]:
        st.subheader("Pollutant Concentration Forecast")
        run_arima_forecast()  # Imported from arima_forecast/forecast_page.py

    # --- Tab 3: Farm Game
    with tabs[2]:
        st.subheader("Farmhand Game Demo")
        show_farm_game()


if __name__ == "__main__":
    main()
