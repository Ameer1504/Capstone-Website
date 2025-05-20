# File: arima_forecast/data_utils.py

import streamlit as st
import pandas as pd
import numpy as np

def clean_numeric(value):
    if pd.isna(value):
        return np.nan
    if isinstance(value, str):
        if value.startswith('<'):
            return 0
        value = value.replace(',', '.')
    try:
        return float(value)
    except:
        return np.nan

@st.cache_data
def load_and_preprocess_data():
    """
    Loads data/nivm_dataset.csv, cleans up, returns a DataFrame.
    """
    try:
        df = pd.read_csv(
            "data/nivm_dataset.csv",
            usecols=lambda col: col not in [
                'Jaar', 'Watertype', 'Hoofdgrondsoort regio',
                'Bedrijfstype', 'Seizoen', 'Aantal bedrijven', 'Eenheid'
            ]
        )
        na_rows = df[df.isna().any(axis=1)]
        if not na_rows.empty:
            st.warning(f"Found {len(na_rows)} rows with NA values:")
            st.dataframe(na_rows.head())  # Show first 5 rows with NAs

        df['Gem'] = df['Gem'].apply(clean_numeric)

        if 'Year' in df.columns:
            df['Year'] = df['Year'].astype(int)

        return df

    except Exception as e:
        st.error(f"Error loading data: {e}")
        return None
