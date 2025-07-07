from langgraph.graph import StateGraph, MessagesState
from langchain.chat_models import init_chat_model

import logging

def build_graph(model_name: str, temperature: float, checkpointer):
    model = init_chat_model(model_name, model_provider="openai", temperature=temperature)

    def call_model(state: MessagesState):
        try:
            response = model.invoke(state["messages"])
            return {"messages": [response]}
        except Exception as e:
            logging.error(f"Error in call_model: {e}", exc_info=True)
            return {"messages": [], "error": str(e)}

    builder = StateGraph(MessagesState)
    builder.add_node("call_model", call_model)
    builder.set_entry_point("call_model")
    builder.set_finish_point("call_model")

    return builder.compile(checkpointer=checkpointer)