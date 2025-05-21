# app.py

import streamlit as st
from arima_forecast.forecast_page import run_arima_forecast

def main():
    st.title("ARIMA Pollutant Forecast")
    st.write("""
        Welcome! This minimal app focuses solely on forecasting pollutant 
        (e.g., nitrate) concentrations using ARIMA.
    """)
    run_arima_forecast()

if __name__ == "__main__":
    main()
