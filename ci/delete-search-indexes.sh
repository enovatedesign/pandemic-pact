#!/bin/bash

index_names=("grants exports")

for index_name in $index_names
do
  curl -X DELETE \
       -H "Authorization: Bearer $MEILISEARCH_MASTER_API_KEY" \
       "${MEILISEARCH_HOST}/indexes/${CI_COMMIT_REF_NAME}-${index_name}"
done
