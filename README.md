# 까망동화

[까망동화 홈페이지](https://kkamangstudio.github.io/donghwa/)에서 그림책을 골라 읽을 수 있습니다.

## 작품 소스

- [고양이와 배짱이](https://kkamangstudio.github.io/donghwa/books/cat-and-katydid/) · 이야기 창작 Yul.J
- [고양이와 배짱이 원문](_books/cat-and-katydid.md) · 제목, 작가, 장면 순서, 문단, 삽화 파일명, 대체 텍스트
- [고양이와 배짱이 삽화](assets/books/cat-and-katydid/) · 장면별 WebP 파일

새 작품은 `_books/`에 영문 파일명으로 추가합니다. 예를 들어 `_books/new-book.md`의 삽화는 `assets/books/new-book/`에 둡니다. 첫 장면의 삽화를 홈페이지에 표시하며, 읽기 주소는 `/donghwa/books/new-book/`입니다. 원문의 `paragraphs`에서 문단은 목록 항목 하나로, 대사 사이 줄바꿈은 같은 항목 안의 새 줄로 씁니다.

## 배포 확인

GitHub Pages는 `main` 브랜치의 루트에서 Jekyll로 홈페이지와 작품 페이지를 만듭니다. Jekyll이 설치된 환경에서는 `jekyll serve`를 실행하고 `http://127.0.0.1:4000/donghwa/`에서 미리 볼 수 있습니다.
