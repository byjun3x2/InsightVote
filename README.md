# InsightVote

프로젝트 세팅

## Yarn 최신 버전 설치
corepack enable

## Yarn Berry (v2 이상) 초기화 (프로젝트 Root 위치에서 실행)
yarn set version berry

## PnP 설정을 기본으로 활성 (yarn 2+ 기본값)
echo "nodeLinker: pnp" > .yarnrc.yml

## 필요한 기본 패키지 초기화 (package.json 생성)
yarn init -y

## Webstorm YarnBerry 설정
yarn add @yarnpkg/sdks -D
## VSCode YarnBerry 설정
yarn dlx @yarnpkg/sdks vscode

## .env.local 생성 (프로젝트 root 위치에)
NEXT_PUBLIC_API_URL=http://본인ip주소:4000

//////////////////////////////////////////////////////////////

## 250926 
해야할일 기본적인 socket.io 통신

1). server 폴더를 만들고 그 안에서 작은 node.js 프로젝트를 실행해야 함
프론트 폴더안의 server 폴더를 만들고 그 안에서 yarn init 을 통한 프로젝트 시작을 할 때 겪는 문제점은 아래와 같다.

>현재 Yarn Berry 환경에서 `server` 폴더가 별도의 프로젝트가 아니라 상위 프로젝트(InsightVote)의 워크스페이스에 포함되지 않아서 생기는 오류입니다.

### 문제 원인

- Yarn Berry는 기본적으로 단일 프로젝트 또는 workspace(모노레포) 환경을 사용합니다.
- 상위 폴더에 있는 `package.json`에 `server` 폴더가 workspace 구성에 포함되어 있지 않으면 하위에서 독립적으로 `yarn init` 또는 패키지 설치가 불가능합니다.

***

### 해결 방법

1. **워크스페이스 설정 (멀티 패키지 프로젝트 형태로 관리)**

  - 상위 루트(InsightVote) `package.json`에 다음과 같이 workspaces를 추가

   ```json
   {
     "private": true,
     "workspaces": ["server"]
   }
   ```

   이렇게 하면 `server` 폴더가 workspace로 인식되어 Yarn 명령어를 상위 루트에서 실행할 수 있습니다.

2. **서버용 패키지는 상위 루트에서 설치**  
   서버에 필요한 패키지 설치 시 상위 루트에서 아래처럼 실행

   ```bash
   yarn workspace server add express socket.io
   yarn workspace server add -D typescript ts-node @types/node @types/express @types/socket.io
   ```

3. **서버 폴더에 빈 `package.json` 생성**  
   `server/package.json` 파일을 생성하고 최소한의 내용만 적어두기

   ```json
   {
     "name": "server",
     "version": "1.0.0",
     "main": "index.ts"
   }
   ```

4. **상위 루트에서 모든 workspace의 의존성 설치**

   ```bash
   yarn install
   ```

***

### 간단 요약

- 상위 루트 `package.json`에 `"workspaces": ["server"]` 추가
- `server` 폴더에 최소 `package.json` 생성
- 상위 루트에서 `yarn workspace server add ...` 명령어로 server 의존성 설치
- `yarn install`로 한꺼번에 패키지 관리

이렇게 하면 Yarn Berry 환경의 멀티 패키지 관리 규칙에 맞게 프로젝트를 구성할 수 있다.


### 개선사항
1. 이미 투표한 항목에서 선택지를 바꾸면 실시간 투표 내역에서 나오게 해야한다.
2. pc판 채팅방 닫기(x모양) 버튼이 안보인다.
3. 모바일 환경에서 안건을 선택하면 채팅창이 선택지를 가리는 현상이 발생해 선택지를 누를 수가 없다.
4. 상태관리 적용
5. 안건을 제안한 사람이 안건 내용을 수정할 수 없음 
6. 안건을 제안한 사람이 안건의 시간을 조절할 수 없음
7. 안건 시간 정할 때 너무 귀찮음
8. 비공개 투표가 없어 투표할 때마다 다른 사람이 무슨 투표를 했는지 보게 된다. (의사결정에 방해가 된다.)
9. 검색창이 있어서 안건 빠르게 찾기 가능했으면
10. 
