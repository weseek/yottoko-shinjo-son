#!/bin/sh
# Migration は Cloud Build パイプライン側 (cloudbuild.yaml の migrate ステップ)
# で実行する。ランタイムイメージは Next.js server を起動するだけ。
exec node server.js
