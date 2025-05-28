# app.py

import streamlit as st
from arima_forecast.forecast_page import run_arima_forecast

def main():
    st.title("Pollutant Forecast")
    st.write("""
        Welcome! This minimal app focuses on forecasting pollutant concentrations in water using ARIMA time-series modelling. The model uses the National Monitoring Network for the Effects of Manure Policy dataset, which contains the average concentrations of chemical water pollutants (like nitrate) in leaching and ditch water across different years, seasons, company, and soil types.This app uses the ARIMA model for forecasting, which is specially designed to analyse patterns over time and predict future trends. The specific version of the model was chosen automatically using an approach that compares different options and selects the one that provides the best fit for the data. We encourage you to explore these predictions and gain insight into how pollutant levels, especially when they fail to decline, can impact water quality!
    """)
    run_arima_forecast()

if __name__ == "__main__":
    main()
