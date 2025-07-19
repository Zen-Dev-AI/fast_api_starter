from langchain_core.prompts import PromptTemplate


def get_custom_rag_prompt():
    """
    Returns a custom RAG prompt template.
    This template is designed to provide context and answer questions concisely.
    """
    # Define the template with placeholders for context and question
    template = """Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Use three sentences maximum and keep the answer as concise as possible.

    {context}

    Question: {question}

    Helpful Answer:"""
    custom_rag_prompt = PromptTemplate.from_template(template)
    return custom_rag_prompt