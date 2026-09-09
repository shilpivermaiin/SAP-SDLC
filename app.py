import anthropic
import streamlit as st

client = anthropic.Anthropic(
    api_key=st.secrets["ANTHROPIC_API_KEY"]
)

st.title("SAP SDLC")

user_input = st.text_area("Requirement")

if st.button("Generate"):

    message = client.messages.create(
        model="claude-sonnet-4",
        max_tokens=4000,
        messages=[
            {
                "role": "user",
                "content": user_input
            }
        ]
    )

    st.write(message.content[0].text)
