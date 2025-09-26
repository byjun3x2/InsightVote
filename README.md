# InsightVote

프로젝트 세팅

## Yarn 최신 버전 설치 (글로벌이 아니면 프로젝트별 설치도 가능)
corepack enable
corepack prepare yarn@stable --activate

## Yarn Berry (v2 이상) 초기화
yarn set version berry

## PnP 설정을 기본으로 활성 (yarn 2+ 기본값)
echo "nodeLinker: pnp" > .yarnrc.yml

## 필요한 기본 패키지 초기화 (package.json 생성)
yarn init -y
