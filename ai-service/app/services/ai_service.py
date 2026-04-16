from fastapi import HTTPException
from app.core.dependencies import supabase, embeddings_model, ask_chain

async def ask_question(tenant_id: str | None, question: str) -> dict:
    try:
        platform_knowledge = (
            "You are an AI mentor on a corporate learning portal. The user is an employee. "
            "If they have organizational questions, technical access issues, or questions completely outside the provided context, "
            "gently advise them to contact their company HR or direct manager."
        ) if tenant_id else (
            "You are an AI mentor on the main global learning platform. Help the user navigate courses, "
            "learning paths, and the platform features. Do not refer them to HR."
        )

        # 1. Embed the question
        query_vector: list[float] = embeddings_model.embed_query(question)

        # 2. Vector search via Supabase RPC
        rpc_response = supabase.rpc(
            "match_document_chunks",
            {
                "query_embedding": query_vector,
                "match_threshold": 0.4,
                "match_count": 5,
                "p_tenant_id": tenant_id,
            },
        ).execute()

        chunks = rpc_response.data or []

        # 3. Assemble context and collect source document names
        context = "\n\n".join(chunk["content"] for chunk in chunks)
        unique_source_ids = list(
            {chunk["document_id"] for chunk in chunks if chunk.get("document_id")}
        )

        source_names: list[str] = []
        if unique_source_ids:
            names_res = (
                supabase.table("documents")
                .select("name")
                .in_("id", unique_source_ids)
                .execute()
            )
            source_names = [r["name"] for r in (names_res.data or [])]

        # 4. Generate answer
        answer: str = await ask_chain.ainvoke(
            {
                "context": context, 
                "question": question, 
                "platform_knowledge": platform_knowledge
            }
        )

        return {"answer": answer, "sources": source_names}

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Ask failed: {str(exc)}",
        ) from exc
