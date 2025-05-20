# File: arima_forecast/model_utils.py

import streamlit as st
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from pmdarima import auto_arima

def fit_arima_model(series, forecast_years):
    """
    Fits an ARIMA model using pmdarima's auto_arima and returns
    the model, predictions, and confidence intervals.
    """
    try:
        model = auto_arima(
            series,
            start_p=0,
            start_q=0,
            max_p=20,
            max_q=20,
            seasonal=False,
            trace=True,
            error_action='ignore',
            suppress_warnings=True,
            stepwise=False
        )
        predictions = model.predict(n_periods=forecast_years)
        conf_int = model.predict(n_periods=forecast_years, return_conf_int=True)[1]
        conf_int = pd.DataFrame(conf_int, columns=['lower', 'upper'])
        return model, np.array(predictions), conf_int

    except Exception as e:
        st.warning(f"ARIMA modeling failed: {str(e)}")
        return None, None, None
