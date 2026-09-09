import streamlit as st

st.set_page_config(
    page_title="SAP SDLC",
    layout="wide"
)

st.title("SAP SDLC Platform")

st.subheader("AI Powered SAP Delivery Framework")

col1, col2, col3 = st.columns(3)

with col1:
    st.button("Scope")

with col2:
    st.button("Solution Architect")

with col3:
    st.button("Functional Specification")

col4, col5, col6 = st.columns(3)

with col4:
    st.button("Technical Specification")

with col5:
    st.button("Code Generation")

with col6:
    st.button("Testing")
