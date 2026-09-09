import streamlit as st

st.title("SAP SDLC")

requirement = st.text_area("Enter Requirement")

if st.button("Generate"):
    st.write("Requirement received:")
    st.write(requirement)
